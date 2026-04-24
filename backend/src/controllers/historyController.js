import pool from "../db.js";

export const getHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT e.entry_id, e.queue_entry_status, e.queue_entry_position, e.queue_priority, e.queue_join_time,
              s.service_name
       FROM queue_entry e
       JOIN services s ON s.service_id = e.service_id
       WHERE e.user_id = $1
       ORDER BY e.queue_join_time DESC`,
      [userId]
    );
    const history = result.rows.map((row) => ({
      id: row.entry_id,
      service: row.service_name,
      status: row.queue_entry_status.charAt(0).toUpperCase() + row.queue_entry_status.slice(1),
      position: row.queue_entry_position,
      priority: row.queue_priority,
      date: new Date(row.queue_join_time).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    }));
    res.json(history);
  } catch (err) {
    console.error("getHistory error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getHistoryByUser = (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }
  res.json(readHistory().filter((entry) => entry.userId === userId));
};

export const addHistory = (req, res) => {
  const userId = req.user?.id || req.body.userId;
  const { service, serviceId, date, notes, status } = req.body;
  const doctor = req.body.doctor || "";

  if (!userId || !service || !date || !status) {
    const missing = ["userId", "service", "date", "status"].find((f) => {
      if (f === "userId") return !userId;
      return !req.body[f];
    });
    return res.status(400).json({ error: `${missing} is required.` });
  }

  if (service.length > 100) {
    return res.status(400).json({ error: "service exceeds max length of 100." });
  }

  if (doctor.length > 100) {
    return res.status(400).json({ error: "doctor exceeds max length of 100." });
  }

  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: "date must be in MM-DD-YYYY format." });
  }

  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  if (notes && notes.length > 300) {
    return res.status(400).json({ error: "notes exceeds max length of 300." });
  }

  const history = readHistory();
  const maxId = history.reduce((max, e) => Math.max(max, e.id), 0);
  const newEntry = { id: maxId + 1, userId, service, doctor, date, notes: notes || "", status };
  if (serviceId) newEntry.serviceId = serviceId;
  history.push(newEntry);
  writeHistory(history);
  res.status(201).json(newEntry);
};

export const updateHistoryEntry = (req, res) => {
  const { id } = req.params;
  const numId = Number(id);
  const { status } = req.body;

  if (isNaN(numId) || !Number.isInteger(numId) || numId <= 0) {
    return res.status(400).json({ error: "id must be a positive integer." });
  }

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}.` });
  }

  const history = readHistory();
  const index = history.findIndex((entry) => entry.id === numId);
  if (index === -1) {
    return res.status(404).json({ error: `Record with id ${id} not found.` });
  }

  if (history[index].userId !== req.user.id) {
    return res.status(403).json({ error: "Forbidden." });
  }

  history[index].status = status;
  writeHistory(history);
  res.json(history[index]);
};

export const deleteHistory = (req, res) => {
  const { id } = req.params;
  const numId = Number(id);

  if (isNaN(numId) || !Number.isInteger(numId)) {
    return res.status(400).json({ error: "id must be a valid integer." });
  }
  if (numId <= 0) {
    return res.status(400).json({ error: "id must be a positive integer." });
  }

  const history = readHistory();
  const index = history.findIndex((entry) => entry.id === numId);
  if (index === -1) {
    return res.status(404).json({ error: `Record with id ${id} not found.` });
  }

  const [deleted] = history.splice(index, 1);
  writeHistory(history);
  res.json({ deleted });
};
