// SECOND, get as JSON

import * as store from "../mock/historyData.js";

const REQUIRED_FIELDS = ["userId", "service", "doctor", "date", "status"];
const MAX_NOTES_LENGTH = 300;
const DATE_REGEX = /^\d{2}-\d{2}-\d{4}$/;


// GET /api/history
// Returns history records for the logged-in user
export const getHistory = (req, res) => {
  const records = store.historyData.filter(r => r.userId === req.user.id);
  res.json(records);
};


// GET /api/history/:userID
// Returns history records for specific user
export const getHistoryByUser = (req, res) => {
  const { userId } = req.params;

  if (!userId || typeof userId !== "string" || userId.trim() === ""){
    return res.status(400).json({ error: "userId param is required" });
  }

  const records = store.historyData.filter(r => r.userId === userId.trim());
  res.json(records);
};


// POST api/history/
// Adds a new history record
export const addHistory = (req, res) => {
  const { userId, service, doctor, date, notes, status } = req.body;

  // Required field check
  for (const field of REQUIRED_FIELDS){
    if (!req.body[field] || String(req.body[field]).trim() === ""){
      return res.status(400).json({ error: `${field} is required` });
    }
  }
  //Type checks
  if (typeof service !== "string" || service.trim().length > 100) {
    return res.status(400).json({ error: "service must be a string under 100 characters" });
  }
  if (typeof doctor !== "string" || doctor.trim().length > 100) {
    return res.status(400).json({ error: "doctor must be a string under 100 characters" });
  }
  if (!DATE_REGEX.test(date)) {
    return res.status(400).json({ error: "date must be in MM-DD-YYYY format" });
  }
  if (notes && notes.length > MAX_NOTES_LENGTH) {
    return res.status(400).json({ error: `notes cannot exceed ${MAX_NOTES_LENGTH} characters` });
  }
  if (!["Completed", "Cancelled", "Pending"].includes(status)) {
    return res.status(400).json({ error: "status must be Completed, Cancelled, or Pending" });
  }

  const newRecord = {
    id: store.idState.nextId++,
    userId: userId.trim(),
    service: service.trim(),
    doctor: doctor.trim(),
    date: date.trim(),
    notes: notes ? notes.trim() : "",
    status
  };

  store.historyData.push(newRecord);
  res.status(201).json(newRecord);
};


// DELETE /api/history/:id
// Removed a history record by ID
export const deleteHistory = (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || id <= 0){
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const index = store.historyData.findIndex(r => r.id === id);

  if (index === -1){
    return res.status(404).json({ error: `No history record found with id ${id}` });
  }

  const deleted = store.historyData.splice(index, 1)[0];
  res.json({ message: "Record deleted", deleted });
};
