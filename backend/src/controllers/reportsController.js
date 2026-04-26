import pool from "../db.js";

export async function getReports(req, res) {
  const { from, to, serviceId, status } = req.query;

  const conditions = [];
  const params = [];

  if (from) {
    params.push(from);
    conditions.push(`e.queue_join_time >= $${params.length}::date`);
  }
  if (to) {
    params.push(to);
    conditions.push(`e.queue_join_time < ($${params.length}::date + interval '1 day')`);
  }
  if (serviceId) {
    params.push(serviceId);
    conditions.push(`e.service_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`e.queue_entry_status = $${params.length}`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  try {
    const result = await pool.query(
      `SELECT e.entry_id, e.queue_entry_status, e.queue_entry_position, e.queue_priority,
              e.queue_join_time, u.user_full_name, s.service_name
       FROM queue_entry e
       JOIN users u ON u.user_id = e.user_id
       JOIN services s ON s.service_id = e.service_id
       ${where}
       ORDER BY e.queue_join_time DESC`,
      params
    );

    const entries = result.rows.map((row) => ({
      id: row.entry_id,
      patient: row.user_full_name,
      service: row.service_name,
      status: row.queue_entry_status,
      priority: row.queue_priority,
      position: row.queue_entry_position,
      joinedAt: row.queue_join_time,
    }));

    const total = entries.length;
    const completed = entries.filter((e) => e.status === "completed").length;
    const cancelled = entries.filter((e) => e.status === "cancelled").length;
    const pending = entries.filter((e) => e.status === "pending").length;

    res.json({ entries, summary: { total, completed, cancelled, pending } });
  } catch (err) {
    console.error("getReports error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
}
