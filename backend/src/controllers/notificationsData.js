import pool from "../db.js";

export async function getNotifications(req, res) {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      "SELECT notif_id, notif_message, notif_status, notif_time FROM notifications WHERE user_id = $1 ORDER BY notif_time DESC",
      [userId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function createNotification(req, res) {
  const userId = req.user.id;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: "Message is required." });

  try {
    const result = await pool.query(
      "INSERT INTO notifications (user_id, notif_message, notif_status) VALUES ($1, $2, 'unread') RETURNING *",
      [userId, message]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("createNotification error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function markAllRead(req, res) {
  const userId = req.user.id;
  try {
    await pool.query(
      "UPDATE notifications SET notif_status = 'read' WHERE user_id = $1",
      [userId]
    );
    return res.status(200).json({ message: "Marked all as read." });
  } catch (err) {
    console.error("markAllRead error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function clearAllNotifications(req, res) {
  const userId = req.user.id;
  try {
    await pool.query("DELETE FROM notifications WHERE user_id = $1", [userId]);
    return res.status(200).json({ message: "Cleared all notifications." });
  } catch (err) {
    console.error("clearAllNotifications error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
