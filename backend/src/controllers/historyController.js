import pool from "../db.js";

const VALID_STATUSES = ["n/a", "sent", "viewed"];

/**
 * Maps a DB row from the history table to the API response shape.
 */
function rowToEntry(row) {
  return {
    id: row.history_id,
    userId: row.user_id,
    serviceId: row.service_id,
    message: row.history_message,
    timestamp: row.history_time,
    status: row.history_status,
  };
}

/**
 * GET /api/history
 * Returns all history records for the authenticated user.
 */
export const getHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT * FROM history WHERE user_id = $1 ORDER BY history_time DESC",
      [userId]
    );
    res.json(result.rows.map(rowToEntry));
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * GET /api/history/:userId
 * Returns all history records for a specific user (admin use).
 */
export const getHistoryByUser = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }
  try {
    const result = await pool.query(
      "SELECT * FROM history WHERE user_id = $1 ORDER BY history_time DESC",
      [userId]
    );
    res.json(result.rows.map(rowToEntry));
  } catch (err) {
    console.error("getHistoryByUser error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * POST /api/history
 * Adds a new history record.
 */
export const addHistory = async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { serviceId, message, status } = req.body;

  if (!userId || !serviceId || !message || !status) {
    const missing = ["userId", "serviceId", "message", "status"].find((f) => {
      if (f === "userId") return !userId;
      return !req.body[f];
    });
    return res.status(400).json({ error: `${missing} is required.` });
  }

  if (message.length > 255) {
    return res.status(400).json({ error: "message exceeds max length of 255." });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO history (user_id, service_id, history_message, history_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, serviceId, message, status]
    );
    res.status(201).json(rowToEntry(result.rows[0]));
  } catch (err) {
    console.error("addHistory error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * PATCH /api/history/:id
 * Updates the status of a history record the authenticated user owns.
 */
export const updateHistoryEntry = async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const { status } = req.body;

  if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ error: "id must be a positive integer." });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  try {
    const check = await pool.query(
      "SELECT user_id FROM history WHERE history_id = $1",
      [numId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ error: `Record with id ${id} not found.` });
    }

    if (check.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: "Forbidden." });
    }

    const result = await pool.query(
      "UPDATE history SET history_status = $1 WHERE history_id = $2 RETURNING *",
      [status, numId]
    );
    res.json(rowToEntry(result.rows[0]));
  } catch (err) {
    console.error("updateHistoryEntry error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * DELETE /api/history/:id
 * Deletes a history record by ID.
 */
export const deleteHistory = async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);

  if (isNaN(numId) || !Number.isInteger(numId)) {
    return res.status(400).json({ error: "id must be a valid integer." });
  }
  if (numId <= 0) {
    return res.status(400).json({ error: "id must be a positive integer." });
  }

  try {
    const result = await pool.query(
      "DELETE FROM history WHERE history_id = $1 RETURNING *",
      [numId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: `Record with id ${id} not found.` });
    }

    res.json({ deleted: rowToEntry(result.rows[0]) });
  } catch (err) {
    console.error("deleteHistory error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
