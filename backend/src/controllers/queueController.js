import pool from "../db.js";

// Priority order: high can skip up to 2 low/mid entries ahead of it.
// Mid can skip up to 1 low entry ahead of it. Low never skips.
function computePriorityOrder(entries) {
  const effective = [...entries];
  for (let i = 0; i < effective.length; i++) {
    const p = effective[i].priority;
    if (p === "high") {
      let skipped = 0;
      let pos = i;
      while (pos > 0 && skipped < 2) {
        const ahead = effective[pos - 1].priority;
        if (ahead === "low" || ahead === "mid") {
          [effective[pos - 1], effective[pos]] = [effective[pos], effective[pos - 1]];
          pos--;
          skipped++;
        } else {
          break;
        }
      }
    } else if (p === "mid") {
      if (i > 0 && effective[i - 1].priority === "low") {
        [effective[i - 1], effective[i]] = [effective[i], effective[i - 1]];
      }
    }
  }
  return effective;
}

async function reorderQueue(queueId) {
  const result = await pool.query(
    `SELECT entry_id, queue_priority FROM queue_entry
     WHERE queue_id = $1 AND queue_entry_status = 'pending'
     ORDER BY queue_entry_position ASC`,
    [queueId]
  );
  const entries = result.rows.map((r) => ({ id: r.entry_id, priority: r.queue_priority }));
  const reordered = computePriorityOrder(entries);
  for (let i = 0; i < reordered.length; i++) {
    await pool.query(
      "UPDATE queue_entry SET queue_entry_position = $1 WHERE entry_id = $2",
      [i + 1, reordered[i].id]
    );
  }
}

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
      priority: row.queue_priority,
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
      `SELECT entry_id, user_id FROM queue_entry
       WHERE service_id = $1 AND queue_entry_status = 'pending'
       ORDER BY queue_entry_position ASC LIMIT 1`,
      [serviceId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Queue is empty for this service." });
    }
    const { entry_id, user_id } = result.rows[0];

    const queueIdRes = await pool.query(
      "SELECT queue_id FROM queue_entry WHERE entry_id = $1",
      [entry_id]
    );

    await pool.query(
      "UPDATE queue_entry SET queue_entry_status = 'completed' WHERE entry_id = $1",
      [entry_id]
    );

    await reorderQueue(queueIdRes.rows[0].queue_id);

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
      "SELECT entry_id FROM queue_entry WHERE entry_id = $1 AND service_id = $2 AND queue_entry_status = 'pending'",
      [entryId, serviceId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found in queue." });
    }

    const queueIdRes = await pool.query(
      "SELECT queue_id FROM queue_entry WHERE entry_id = $1",
      [entryId]
    );

    await pool.query(
      "UPDATE queue_entry SET queue_entry_status = 'cancelled' WHERE entry_id = $1",
      [entryId]
    );

    await reorderQueue(queueIdRes.rows[0].queue_id);

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
  const { priority } = req.body;
  const userId = req.user.id;

  try {
    const queueResult = await pool.query(
      "SELECT queue_id FROM queue WHERE service_id = $1 AND is_deleted = false LIMIT 1",
      [serviceId]
    );
    if (queueResult.rows.length === 0) {
      return res.status(404).json({ message: "No queue found for this service." });
    }
    const queueId = queueResult.rows[0].queue_id;

    const existing = await pool.query(
      "SELECT entry_id FROM queue_entry WHERE queue_id = $1 AND user_id = $2 AND queue_entry_status = 'pending'",
      [queueId, userId]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Already in this queue." });
    }

    const posResult = await pool.query(
      "SELECT COALESCE(MAX(queue_entry_position), 0) + 1 AS next_pos FROM queue_entry WHERE queue_id = $1 AND queue_entry_status = 'pending'",
      [queueId]
    );
    const position = posResult.rows[0].next_pos;

    const normalizedPriority = ({ low: "low", medium: "mid", mid: "mid", high: "high" })[(priority || "low").toLowerCase()] ?? "low";

    const entry = await pool.query(
      `INSERT INTO queue_entry (queue_id, service_id, user_id, queue_entry_status, queue_entry_position, queue_priority)
       VALUES ($1, $2, $3, 'pending', $4, $5) RETURNING *`,
      [queueId, serviceId, userId, position, normalizedPriority]
    );

    await reorderQueue(queueId);

    const updated = await pool.query(
      "SELECT * FROM queue_entry WHERE entry_id = $1",
      [entry.rows[0].entry_id]
    );
    const row = updated.rows[0];
    return res.status(201).json({
      id: row.entry_id,
      userId: row.user_id,
      serviceId: row.service_id,
      priority: row.queue_priority,
      status: row.queue_entry_status,
      position: row.queue_entry_position,
      date: row.queue_join_time,
    });
  } catch (err) {
    console.error("joinQueue error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function leaveQueue(req, res) {
  const { serviceId, entryId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT entry_id FROM queue_entry WHERE entry_id = $1 AND service_id = $2 AND user_id = $3 AND queue_entry_status = 'pending'",
      [entryId, serviceId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const queueRes = await pool.query(
      "SELECT queue_id FROM queue_entry WHERE entry_id = $1",
      [entryId]
    );
    const queueId = queueRes.rows[0].queue_id;

    await pool.query(
      "UPDATE queue_entry SET queue_entry_status = 'cancelled' WHERE entry_id = $1",
      [entryId]
    );

    await reorderQueue(queueId);

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
      priority: row.queue_priority,
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
