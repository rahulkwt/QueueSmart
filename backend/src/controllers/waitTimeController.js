import pool from "../db.js";

/**
 * Builds the effective queue order by letting High-priority entries
 * skip ahead of up to 2 Low or Medium-priority entries that are in front of them.
 * Other High entries are never skipped. Medium entries cannot skip anyone.
 *
 * @param {Array} queue - FIFO-ordered queue entries for one service.
 * @returns {Array} Reordered queue reflecting priority skips.
 */
export function computeEffectiveQueue(queue) {
  const effective = [...queue];

  for (let i = 0; i < effective.length; i++) {
    const p = effective[i].priority.toLowerCase();
    if (p === "high") {
      let skipped = 0;
      let pos = i;
      while (pos > 0 && skipped < 2) {
        const ahead = effective[pos - 1].priority.toLowerCase();
        if (ahead === "low" || ahead === "mid" || ahead === "medium") {
          [effective[pos - 1], effective[pos]] = [effective[pos], effective[pos - 1]];
          pos--;
          skipped++;
        } else {
          break;
        }
      }
    } else if (p === "mid" || p === "medium") {
      if (i > 0 && effective[i - 1].priority.toLowerCase() === "low") {
        [effective[i - 1], effective[i]] = [effective[i], effective[i - 1]];
      }
    }
  }

  return effective;
}

/**
 * GET /api/queue/:serviceId/wait-time?avgDuration=10&entryId=xxx
 *
 * Computes estimated wait times for a service's queue, factoring in
 * priority-based reordering (High skips up to 2 Low entries).
 *
 * Query params:
 *   avgDuration - average service duration in minutes (default 10)
 *   entryId     - optional; if provided, returns only that entry's wait time
 */
export async function getWaitTime(req, res) {
  const { serviceId } = req.params;
  const { avgDuration, entryId } = req.query;

  let duration = 10;
  if (avgDuration !== undefined) {
    duration = Number(avgDuration);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "avgDuration must be a positive number." });
    }
  }

  try {
    const result = await pool.query(
      `SELECT e.entry_id, e.queue_entry_position, e.queue_priority, u.user_full_name,
              COALESCE(s.service_duration, $2) AS service_duration
       FROM queue_entry e
       JOIN users u ON u.user_id = e.user_id
       JOIN services s ON s.service_id = e.service_id
       WHERE e.service_id = $1 AND e.queue_entry_status = 'pending'
       ORDER BY e.queue_entry_position ASC`,
      [serviceId, duration]
    );

    const serviceQueue = result.rows.map((row) => ({
      id: row.entry_id,
      name: row.user_full_name,
      priority: row.queue_priority,
      serviceDuration: parseInt(row.service_duration),
    }));

    const effectiveQueue = computeEffectiveQueue(serviceQueue);
    const avgDur = effectiveQueue[0]?.serviceDuration ?? duration;

    if (entryId) {
      const position = effectiveQueue.findIndex((e) => String(e.id) === String(entryId));
      if (position === -1) {
        return res.status(404).json({ error: "Entry not found in this service's queue." });
      }
      return res.json({
        entryId,
        position,
        estimatedWaitMinutes: position * avgDur,
        avgDuration: avgDur,
      });
    }

    const waitTimes = effectiveQueue.map((entry, position) => ({
      entryId: entry.id,
      name: entry.name,
      priority: entry.priority,
      position,
      estimatedWaitMinutes: position * avgDur,
    }));

    return res.json({ serviceId, avgDuration: avgDur, queue: waitTimes });
  } catch (err) {
    console.error("getWaitTime error:", err);
    return res.status(500).json({ error: "Internal server error." });
  }
}
