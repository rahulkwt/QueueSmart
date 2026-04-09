import pool from "../db.js";

/**
 * Returns pending entries for a service's active queue, ordered by position.
 * Joins users to expose the person's name for display.
 * @param {import('express').Request} req - Params: { serviceId }
 * @param {import('express').Response} res - 200 with array of pending entries.
 */
export async function getQueue(req, res) {
  const { serviceId } = req.params;
  try {
    const result = await pool.query(
      `SELECT qe.entry_id             AS id,
              u.user_full_name         AS name,
              qe.queue_entry_position  AS position,
              qe.queue_priority        AS priority,
              qe.queue_join_time       AS "joinTime"
       FROM queue_entry qe
       JOIN queue  q ON q.queue_id  = qe.queue_id
       JOIN users  u ON u.user_id   = qe.user_id
       WHERE q.service_id = $1
         AND q.is_deleted = FALSE
         AND qe.queue_entry_status = 'pending'
       ORDER BY qe.queue_entry_position`,
      [serviceId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Marks the lowest-position pending entry for a service as 'completed'.
 * @param {import('express').Request} req - Params: { serviceId }
 * @param {import('express').Response} res - 200 with served entry, 404 if queue is empty.
 */
export async function serveNext(req, res) {
  const { serviceId } = req.params;
  try {
    const result = await pool.query(
    `UPDATE queue_entry
     SET queue_entry_status = 'completed'
     WHERE entry_id = (
       SELECT qe.entry_id
       FROM queue_entry qe
       JOIN queue q ON q.queue_id = qe.queue_id
       WHERE q.service_id = $1
         AND q.is_deleted = FALSE
         AND qe.queue_entry_status = 'pending'
       ORDER BY qe.queue_entry_position
       LIMIT 1
       FOR UPDATE SKIP LOCKED
     )
     RETURNING entry_id AS id, queue_entry_position AS position
     UPDATE queue_entry
      SET queue_entry_position = sub.new_pos
      FROM (
        SELECT entry_id,
              ROW_NUMBER() OVER (ORDER BY queue_entry_position) AS new_pos
        FROM queue_entry qe
        JOIN queue q ON q.queue_id = qe.queue_id
        WHERE q.service_id = $1
          AND qe.queue_entry_status = 'pending'
      ) sub
      WHERE queue_entry.entry_id = sub.entry_id;`,
    [serviceId]
  );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Queue is empty for this service." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Marks a specific pending entry as 'cancelled' (admin remove).
 * Verifies the entry belongs to the given service via the queue join.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 on success, 404 if not found.
 */
export async function removeFromQueue(req, res) {
  const { serviceId, entryId } = req.params;
  try {
    const result = await pool.query(
    `UPDATE queue_entry
     SET queue_entry_status = 'cancelled'
     FROM queue q
     WHERE queue_entry.queue_id = q.queue_id
       AND queue_entry.entry_id = $1
       AND q.service_id = $2
       AND q.is_deleted = FALSE
       AND queue_entry.queue_entry_status = 'pending'`,
    [entryId, serviceId]
  );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entry not found in queue." });
    }

    return res.status(200).json({ message: "Removed from queue." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Swaps a pending entry's position with the one directly ahead of it.
 * Runs inside a transaction to keep positions consistent.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 with updated queue, 400 if at front, 404 if not found.
 */
export async function moveUp(req, res) {
  const { serviceId, entryId } = req.params;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Verify the target entry exists and is pending for this service
    const currentResult = await client.query(
      `SELECT qe.entry_id, qe.queue_entry_position, qe.queue_id
       FROM queue_entry qe
       JOIN queue q ON q.queue_id = qe.queue_id
       WHERE qe.entry_id = $1
         AND q.service_id = $2
         AND q.is_deleted = FALSE
         AND qe.queue_entry_status = 'pending'`,
      [entryId, serviceId]
    );

    if (currentResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Entry not found in queue." });
    }

    const { queue_entry_position: currentPos, queue_id: queueId } = currentResult.rows[0];

    // Find the nearest pending entry with a lower position in the same queue
    const prevResult = await client.query(
      `SELECT entry_id, queue_entry_position
       FROM queue_entry
       WHERE queue_id = $1
         AND queue_entry_status = 'pending'
         AND queue_entry_position < $2
       ORDER BY queue_entry_position DESC
       LIMIT 1`,
      [queueId, currentPos]
    );

    if (prevResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Entry is already at the front." });
    }

    const { entry_id: prevEntryId, queue_entry_position: prevPos } = prevResult.rows[0];

    // Swap the two positions
    // Swap the two positions atomically to avoid constraint violations
    await client.query(
      `-- step 1
       UPDATE queue_entry SET queue_entry_position = -1 WHERE entry_id = $1;
       -- step 2
       UPDATE queue_entry SET queue_entry_position = $currentPos WHERE entry_id = $prevEntryId;
       -- step 3
       UPDATE queue_entry SET queue_entry_position = $prevPos WHERE entry_id = $1;`,
      [entryId, prevPos, prevEntryId, currentPos]
    );

    await client.query("COMMIT");

    // Return the updated queue for this service
    const updated = await pool.query(
      `SELECT qe.entry_id             AS id,
              u.user_full_name         AS name,
              qe.queue_entry_position  AS position,
              qe.queue_priority        AS priority,
              qe.queue_join_time       AS "joinTime"
       FROM queue_entry qe
       JOIN queue  q ON q.queue_id = qe.queue_id
       JOIN users  u ON u.user_id  = qe.user_id
       WHERE q.service_id = $1
         AND q.is_deleted = FALSE
         AND qe.queue_entry_status = 'pending'
       ORDER BY qe.queue_entry_position`,
      [serviceId]
    );

    return res.status(200).json(updated.rows);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    client.release();
  }
}

/**
 * Adds the authenticated user to a service's active queue.
 * Rejects if the user already has a pending entry for this service.
 * @param {import('express').Request} req - Params: { serviceId }. Body: { priority }
 * @param {import('express').Response} res - 201 with new entry, 400 if already in queue, 404 if no active queue.
 */
export async function joinQueue(req, res) {
  const { serviceId } = req.params;
  const { priority = "low" } = req.body;
  const userId = req.user.id;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Find the active queue for this service
    const queueResult = await client.query(
      `SELECT queue_id FROM queue
       WHERE service_id = $1 AND is_deleted = FALSE
       ORDER BY service_creation_date
       LIMIT 1`,
      [serviceId]
    );

    if (queueResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "No active queue for this service." });
    }

    const queueId = queueResult.rows[0].queue_id;

    // Reject if already pending in this queue
    const dupCheck = await client.query(
      `SELECT 1 FROM queue_entry
       WHERE queue_id = $1 AND user_id = $2 AND queue_entry_status = 'pending'`,
      [queueId, userId]
    );

    if (dupCheck.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Already in this queue." });
    }

    // Determine the next position
    const posResult = await client.query(
      `SELECT COALESCE(MAX(queue_entry_position), 0) + 1 AS next_pos
       FROM queue_entry
       WHERE queue_id = $1 AND queue_entry_status = 'pending'`,
      [queueId]
    );
    const nextPos = posResult.rows[0].next_pos;

    const validPriority = ["low", "mid", "high"].includes(priority) ? priority : "low";

    const insertResult = await client.query(
      `INSERT INTO queue_entry (queue_id, user_id, queue_entry_status, queue_entry_position, queue_priority)
       VALUES ($1, $2, 'pending', $3, $4)
       RETURNING entry_id AS id, queue_entry_position AS position, queue_priority AS priority, queue_join_time AS "joinTime"`,
      [queueId, userId, nextPos, validPriority]
    );

    await client.query("COMMIT");
    return res.status(201).json(insertResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  } finally {
    client.release();
  }
}

/**
 * Cancels the authenticated user's pending entry in a service's queue.
 * Verifies ownership — only the entry's owner can leave.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 on success, 404 if not found or not owned.
 */
export async function leaveQueue(req, res) {
  const { serviceId, entryId } = req.params;
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `UPDATE queue_entry qe
       SET queue_entry_status = 'cancelled'
       FROM queue q
       WHERE qe.queue_id = q.queue_id
         AND qe.entry_id = $1
         AND q.service_id = $2
         AND qe.user_id = $3
         AND qe.queue_entry_status = 'pending'`,
      [entryId, serviceId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Entry not found." });
    }

    return res.status(200).json({ message: "Left queue." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Returns all pending queue entries belonging to the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with array of the user's pending entries.
 */
export async function getMyQueues(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT qe.entry_id            AS id,
              q.service_id           AS "serviceId",
              s.service_name         AS "serviceName",
              qe.queue_entry_position AS position,
              qe.queue_priority       AS priority,
              qe.queue_join_time      AS "joinTime"
       FROM queue_entry qe
       JOIN queue    q ON q.queue_id    = qe.queue_id
       JOIN services s ON s.service_id  = q.service_id
       WHERE qe.user_id = $1
         AND qe.queue_entry_status = 'pending'
         AND q.is_deleted = FALSE
       ORDER BY qe.queue_join_time`,
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
