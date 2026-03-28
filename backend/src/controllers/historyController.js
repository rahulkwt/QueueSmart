import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = join(__dirname, "../data/history.json");

const VALID_STATUSES = ["Pending", "Completed", "Cancelled", "Aborted"];
const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;

function readHistory() {
  return JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
}

function writeHistory(history) {
  writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
}

export const getHistory = (req, res) => {
  const userId = req.user.id;
  const history = readHistory().filter((entry) => entry.userId === userId);
  res.json(history);
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
