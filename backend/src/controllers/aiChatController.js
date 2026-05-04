import pool from "../db.js";
import { callGroq } from "../../llama/llamaService.js";

async function buildDbContext(userId) {
  const [servicesRes, historyRes, dayRes, userQueuesRes, userHistRes] =
    await Promise.all([
      // Live queue status: pending counts + priority breakdown per service
      pool.query(`
        SELECT
          s.service_name,
          s.service_description,
          s.service_duration,
          COUNT(qe.entry_id) FILTER (WHERE qe.queue_entry_status = 'pending')                                  AS pending,
          COUNT(qe.entry_id) FILTER (WHERE qe.queue_entry_status = 'pending' AND qe.queue_priority = 'high')   AS high_p,
          COUNT(qe.entry_id) FILTER (WHERE qe.queue_entry_status = 'pending' AND qe.queue_priority = 'mid')    AS mid_p,
          COUNT(qe.entry_id) FILTER (WHERE qe.queue_entry_status = 'pending' AND qe.queue_priority = 'low')    AS low_p
        FROM services s
        LEFT JOIN queue_entry qe ON qe.service_id = s.service_id
        WHERE s.service_is_deleted = false
        GROUP BY s.service_id, s.service_name, s.service_description, s.service_duration
        ORDER BY pending DESC
      `),
      // Historical completion/cancellation rates per service
      pool.query(`
        SELECT
          s.service_name,
          COUNT(h.history_id)                                                    AS total,
          COUNT(h.history_id) FILTER (WHERE h.history_status = 'completed')     AS completed,
          COUNT(h.history_id) FILTER (WHERE h.history_status = 'cancelled')     AS cancelled
        FROM services s
        LEFT JOIN history h ON h.service_id = s.service_id
        WHERE s.service_is_deleted = false
        GROUP BY s.service_id, s.service_name
        ORDER BY total DESC
      `),
      // Day-of-week traffic patterns from historical visit timestamps
      pool.query(`
        SELECT
          TRIM(TO_CHAR(history_time, 'Day')) AS day_name,
          EXTRACT(DOW FROM history_time)     AS day_num,
          COUNT(*)                           AS visits
        FROM history
        GROUP BY day_num, day_name
        ORDER BY visits ASC
      `),
      // Requesting user's active queue positions with accurate pending-ahead wait estimate
      pool.query(`
        SELECT
          s.service_name,
          qe.queue_entry_position                                                AS position,
          qe.queue_priority                                                      AS priority,
          s.service_duration,
          (
            SELECT COUNT(*)
            FROM queue_entry ahead
            WHERE ahead.queue_id             = qe.queue_id
              AND ahead.queue_entry_status   = 'pending'
              AND ahead.queue_entry_position < qe.queue_entry_position
          ) * s.service_duration                                                 AS est_wait_min
        FROM queue_entry qe
        JOIN services s ON s.service_id = qe.service_id
        WHERE qe.user_id = $1 AND qe.queue_entry_status = 'pending'
        ORDER BY s.service_name
      `, [userId]),
      // Requesting user's 5 most recent visits (no clinical notes — privacy)
      pool.query(`
        SELECT history_service_name, history_status
        FROM history
        WHERE user_id = $1
        ORDER BY history_time DESC
        LIMIT 5
      `, [userId]),
    ]);

  const lines = [];

  // --- Services + live queue state ---
  lines.push("[SERVICES — live data]");
  if (servicesRes.rows.length === 0) {
    lines.push("No services configured.");
  } else {
    for (const r of servicesRes.rows) {
      const pending  = parseInt(r.pending, 10);
      const estWait  = pending * parseInt(r.service_duration, 10);
      lines.push(
        `• ${r.service_name} (${r.service_duration} min/patient) — ${r.service_description}` +
        `\n  Now: ${pending} pending (${r.high_p} high, ${r.mid_p} mid, ${r.low_p} low priority). Est. new-joiner wait: ~${estWait} min.`
      );
    }
  }

  // --- Historical completion rates ---
  lines.push("\n[HISTORICAL COMPLETION RATES]");
  const withHistory = historyRes.rows.filter((r) => parseInt(r.total, 10) > 0);
  if (withHistory.length === 0) {
    lines.push("No historical data yet.");
  } else {
    for (const r of withHistory) {
      const total = parseInt(r.total, 10);
      const pct = (v) => Math.round((parseInt(v, 10) / total) * 100);
      lines.push(
        `• ${r.service_name}: ${total} visits — ${pct(r.completed)}% completed, ${pct(r.cancelled)}% cancelled`
      );
    }
  }

  // --- Day-of-week traffic patterns ---
  lines.push("\n[TRAFFIC PATTERNS — visits by day of week]");
  if (dayRes.rows.length === 0) {
    lines.push("No historical data to determine patterns.");
  } else if (dayRes.rows.length < 3) {
    lines.push(
      "Insufficient variety in historical data to determine reliable day-of-week patterns yet."
    );
  } else {
    const totalVisits = dayRes.rows.reduce((s, r) => s + parseInt(r.visits, 10), 0);
    const sorted   = [...dayRes.rows].sort((a, b) => parseInt(a.visits) - parseInt(b.visits));
    const quietest = sorted.slice(0, 2).map((r) => `${r.day_name} (${r.visits} visits)`).join(", ");
    const busiest  = sorted.slice(-2).reverse().map((r) => `${r.day_name} (${r.visits} visits)`).join(", ");
    lines.push(`Quietest days (fewest visits): ${quietest}`);
    lines.push(`Busiest days (most visits): ${busiest}`);
    lines.push(`Based on ${totalVisits} total recorded visits across ${dayRes.rows.length} days of the week.`);
  }

  // --- User's active queues ---
  lines.push("\n[YOUR CURRENT QUEUES]");
  if (userQueuesRes.rows.length === 0) {
    lines.push("Not currently in any queue.");
  } else {
    for (const r of userQueuesRes.rows) {
      lines.push(
        `• ${r.service_name}: position #${r.position}, ~${r.est_wait_min} min wait (${r.priority} priority)`
      );
    }
  }

  // --- User's recent visit history (no clinical notes) ---
  lines.push("\n[YOUR RECENT VISIT HISTORY]");
  if (userHistRes.rows.length === 0) {
    lines.push("No visit history on record.");
  } else {
    for (const r of userHistRes.rows) {
      lines.push(`• ${r.history_service_name} — ${r.history_status}`);
    }
  }

  return lines.join("\n");
}

export async function handleChat(req, res) {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const dbContext = await buildDbContext(req.user.id);
    const reply = await callGroq(message.trim(), history, req.user.role, dbContext);
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
