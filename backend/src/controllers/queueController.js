import pool from "../db.js";

// DB stores 'low'/'mid'/'high'; frontend expects 'Low'/'Medium'/'High'.
const PRIORITY_IN = { low: "low", medium: "mid", high: "high" };
const PRIORITY_OUT = { low: "Low", mid: "Medium", high: "High" };

export async function getQueue(req, res) {
  const { serviceId } = req.params;
  try {
    const result = await pool.query(
      `SELECT e.entry_id, e.user_id, e.queue_priority, e.queue_entry_status, e.queue_entry_position, e.queue_join_time,
              u.user_full_name
       FROM queue_entry e
       JOIN users u ON u.user_id = e.user_id
       WHERE e.service_id = $1 AND e.queue_entry_status = 'pending'
       ORDER BY e.queue_entry_position ASC`,
      [serviceId]
    );
    const queue = result.rows.map((row) => ({
      id: row.entry_id,
      userId: row.user_id,
      name: row.user_full_name,
      serviceId: parseInt(serviceId),
      priority: PRIORITY_OUT[row.queue_priority] || row.queue_priority,
      status: row.queue_entry_status,
      position: row.queue_entry_position,
      date: row.queue_join_time,
    }));
    return res.status(200).json(queue);
  } catch (err) {
    console.error("getQueue error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function serveNext(req, res) {
  const { serviceId } = req.params;
  try {
    const result = await pool.query(
      `SELECT entry_id, user_id, history_id FROM queue_entry
       WHERE service_id = $1 AND queue_entry_status = 'pending'
       ORDER BY queue_entry_position ASC LIMIT 1`,
      [serviceId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Queue is empty for this service." });
    }
    const { entry_id, user_id, history_id } = result.rows[0];

    await pool.query(
      "UPDATE queue_entry SET queue_entry_status = 'completed' WHERE entry_id = $1",
      [entry_id]
    );

    if (history_id) {
      await pool.query(
        "UPDATE history SET history_status = 'completed' WHERE history_id = $1",
        [history_id]
      );
    }

    return res.status(200).json({ message: "Served.", entryId: entry_id, userId: user_id });
  } catch (err) {
    console.error("serveNext error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function removeFromQueue(req, res) {
  const { serviceId, entryId } = req.params;
  try {
    const result = await pool.query(
      "SELECT entry_id, history_id FROM queue_entry WHERE entry_id = $1 AND service_id = $2 AND queue_entry_status = 'pending'",
      [entryId, serviceId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found in queue." });
    }
    const { history_id } = result.rows[0];

    await pool.query(
      "UPDATE queue_entry SET queue_entry_status = 'cancelled' WHERE entry_id = $1",
      [entryId]
    );

    if (history_id) {
      await pool.query(
        "UPDATE history SET history_status = 'cancelled' WHERE history_id = $1",
        [history_id]
      );
    }

    return res.status(200).json({ message: "Removed from queue." });
  } catch (err) {
    console.error("removeFromQueue error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function moveUp(req, res) {
  const { serviceId, entryId } = req.params;
  try {
    const result = await pool.query(
      `SELECT entry_id, queue_entry_position FROM queue_entry
       WHERE service_id = $1 AND queue_entry_status = 'pending'
       ORDER BY queue_entry_position ASC`,
      [serviceId]
    );

    const entries = result.rows;
    const idx = entries.findIndex((e) => e.entry_id === parseInt(entryId));

    if (idx === -1) return res.status(404).json({ message: "Entry not found in queue." });
    if (idx === 0) return res.status(400).json({ message: "Entry is already at the front." });

    const current = entries[idx];
    const above = entries[idx - 1];

    // Swap positions
    await pool.query("UPDATE queue_entry SET queue_entry_position = $1 WHERE entry_id = $2", [above.queue_entry_position, current.entry_id]);
    await pool.query("UPDATE queue_entry SET queue_entry_position = $1 WHERE entry_id = $2", [current.queue_entry_position, above.entry_id]);

    const updated = await pool.query(
      `SELECT entry_id, user_id, queue_entry_position, queue_priority, queue_entry_status
       FROM queue_entry WHERE service_id = $1 AND queue_entry_status = 'pending'
       ORDER BY queue_entry_position ASC`,
      [serviceId]
    );
    return res.status(200).json(updated.rows.map((row) => ({
      id: row.entry_id,
      userId: row.user_id,
      serviceId: parseInt(serviceId),
      priority: row.queue_priority,
      status: row.queue_entry_status,
      position: row.queue_entry_position,
    })));
  } catch (err) {
    console.error("moveUp error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function joinQueue(req, res) {
  const { serviceId } = req.params;
  const { priority = "low" } = req.body;
  const userId = req.user.id;

  // Normalize frontend values ('Low'/'Medium'/'High') to DB values ('low'/'mid'/'high').
  const dbPriority = PRIORITY_IN[(priority || "low").toLowerCase()] || "low";

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const queueResult = await client.query(
      "SELECT queue_id FROM queue WHERE service_id = $1 AND is_deleted = false LIMIT 1",
      [serviceId]
    );
    if (queueResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "No queue found for this service." });
    }
    const queueId = queueResult.rows[0].queue_id;

    const existing = await client.query(
      "SELECT entry_id FROM queue_entry WHERE queue_id = $1 AND user_id = $2 AND queue_entry_status = 'pending'",
      [queueId, userId]
    );
    if (existing.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Already in this queue." });
    }

    const posResult = await client.query(
      "SELECT COALESCE(MAX(queue_entry_position), 0) + 1 AS next_pos FROM queue_entry WHERE queue_id = $1 AND queue_entry_status = 'pending'",
      [queueId]
    );
    const position = posResult.rows[0].next_pos;

    const svcResult = await client.query(
      "SELECT service_name FROM services WHERE service_id = $1",
      [serviceId]
    );
    const serviceName = svcResult.rows[0]?.service_name || "Unknown Service";

    // Create the history row first, then the queue entry that references it.
    // Both are inside a transaction so a failure in either rolls everything back.
    const histResult = await client.query(
      `INSERT INTO history (user_id, service_id, history_service_name, history_status)
       VALUES ($1, $2, $3, 'pending') RETURNING history_id`,
      [userId, serviceId, serviceName]
    );
    const historyId = histResult.rows[0].history_id;

    const entry = await client.query(
      `INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority, history_id)
       VALUES ($1, $2, $3, 'pending', $4, $5, $6) RETURNING *`,
      [queueId, serviceId, userId, position, dbPriority, historyId]
    );

    await client.query("COMMIT");

    const row = entry.rows[0];
    return res.status(201).json({
      id: row.entry_id,
      userId: row.user_id,
      serviceId: row.service_id,
      priority: PRIORITY_OUT[row.queue_priority] || row.queue_priority,
      status: row.queue_entry_status,
      position: row.queue_entry_position,
      date: row.queue_join_time,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("joinQueue error:", err);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    client.release();
  }
}

export async function leaveQueue(req, res) {
  const { serviceId, entryId } = req.params;
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `UPDATE queue_entry
       SET queue_entry_status = 'cancelled'
       WHERE entry_id = $1
         AND service_id = $2
         AND user_id = $3
         AND queue_entry_status = 'pending'
       RETURNING entry_id, history_id`,
      [entryId, serviceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const { history_id } = result.rows[0];
    if (history_id) {
      await pool.query(
        "UPDATE history SET history_status = 'cancelled' WHERE history_id = $1",
        [history_id]
      );
    }

    return res.status(200).json({ message: "Left queue." });
  } catch (err) {
    console.error("leaveQueue error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function getMyQueues(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT entry_id, service_id, queue_entry_status, queue_entry_position, queue_priority, queue_join_time
       FROM queue_entry WHERE user_id = $1 AND queue_entry_status = 'pending'
       ORDER BY queue_join_time DESC`,
      [userId]
    );
    const entries = result.rows.map((row) => ({
      id: row.entry_id,
      userId,
      serviceId: row.service_id,
      priority: PRIORITY_OUT[row.queue_priority] || row.queue_priority,
      status: row.queue_entry_status,
      position: row.queue_entry_position,
      date: row.queue_join_time,
    }));
    return res.status(200).json(entries);
  } catch (err) {
    console.error("getMyQueues error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
