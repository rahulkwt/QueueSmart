import pool from "../db.js";

const VALID_STATUSES = ["pending", "completed", "cancelled"];

/**
 * Formats a Date/timestamp into MM-DD-YYYY for the frontend history table.
 */
function formatDate(ts) {
  const d = new Date(ts);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/**
 * Maps a DB row from the history table to the API response shape expected by
 * UserHistory.jsx (service, doctor, date, status, notes).
 * "doctor" is not tracked in the DB so it is returned as null.
 */
function rowToEntry(row) {
  return {
    id: row.history_id,
    userId: row.user_id,
    serviceId: row.service_id,
    service: row.history_service_name,
    doctor: null,
    date: formatDate(row.history_time),
    notes: row.history_notes || null,
    status: row.history_status.charAt(0).toUpperCase() + row.history_status.slice(1), // "pending" → "Pending"
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
 * POST /api/user/history
 * Creates a new queue-participation history record.
 * Accepts { service, serviceId, status } from QueueScreen when the user joins.
 * "service" is the human-readable service name stored for display.
 * "status" must be one of: pending, completed, cancelled (case-insensitive).
 */
export const addHistory = async (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { service, serviceId, status } = req.body;

  if (!userId || !service || !serviceId || !status) {
    const missing = ["userId", "service", "serviceId", "status"].find((f) => {
      if (f === "userId") return !userId;
      return !req.body[f];
    });
    return res.status(400).json({ error: `${missing} is required.` });
  }

  if (service.length > 255) {
    return res.status(400).json({ error: "service name exceeds max length of 255." });
  }

  const normalizedStatus = status.toLowerCase();
  if (!VALID_STATUSES.includes(normalizedStatus)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  try {
    const result = await pool.query(
      `INSERT INTO history (user_id, service_id, history_service_name, history_status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, serviceId, service, normalizedStatus]
    );
    res.status(201).json(rowToEntry(result.rows[0]));
  } catch (err) {
    console.error("addHistory error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * PATCH /api/user/history/:id
 * Updates the status of a history record the authenticated user owns.
 * QueueScreen sends { status: "Completed" } or { status: "Cancelled" } — accepted case-insensitively.
 */
export const updateHistoryEntry = async (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const { status } = req.body;

  if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ error: "id must be a positive integer." });
  }

  const normalizedStatus = status ? status.toLowerCase() : null;
  if (!normalizedStatus || !VALID_STATUSES.includes(normalizedStatus)) {
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
      [normalizedStatus, numId]
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
