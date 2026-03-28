import { historyData, idState } from "../mock/historyData.js";

const VALID_STATUSES = ["Pending", "Completed", "Cancelled", "Aborted"];
const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

export const getHistory = (req, res) => {
  res.json(historyData);
};

export const getHistoryByUser = (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "userId is required." });
  }
  res.json(historyData.filter((entry) => entry.userId === userId));
};

export const addHistory = (req, res) => {
  const { userId, service, doctor, date, notes, status } = req.body;

  if (!userId || !service || !doctor || !date || !status) {
    const missing = ["userId", "service", "doctor", "date", "status"].find((f) => !req.body[f]);
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

  const newEntry = { id: idState.nextId++, userId, service, doctor, date, notes: notes || "", status };
  historyData.push(newEntry);
  res.status(201).json(newEntry);
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

  const index = historyData.findIndex((entry) => entry.id === numId);
  if (index === -1) {
    return res.status(404).json({ error: `Record with id ${id} not found.` });
  }

  const [deleted] = historyData.splice(index, 1);
  res.json({ deleted });
};
