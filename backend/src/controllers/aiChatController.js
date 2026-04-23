import pool from "../db.js";
import { callGemini } from "../../gemini/geminiService.js";

async function getDbContext() {
  const { rows } = await pool.query(`
    SELECT
      s.service_name,
      COUNT(qe.entry_id) FILTER (WHERE qe.queue_entry_status = 'pending') AS pending_count
    FROM services s
    LEFT JOIN queue_entry qe ON qe.service_id = s.service_id
    WHERE s.service_is_deleted = false
    GROUP BY s.service_id, s.service_name
    ORDER BY pending_count DESC
  `);

  if (rows.length === 0) return "No services configured.";

  const parts = rows.map((r) => `${r.service_name}(${r.pending_count})`);
  const total = rows.reduce((sum, r) => sum + parseInt(r.pending_count, 10), 0);
  return `Queue: ${parts.join(", ")}. Total waiting: ${total}`;
}

export async function handleChat(req, res) {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "message is required" });
  }

  try {
    const dbContext = await getDbContext();
    const reply = await callGemini(message.trim(), history, req.user.role, dbContext);
    res.json({ reply });
  } catch (err) {
    console.error("AI chat error:", err.message);
    res.status(500).json({ error: "AI service unavailable. Please try again." });
  }
}
