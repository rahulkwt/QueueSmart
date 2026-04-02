import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "../data/queue.json");
const HISTORY_FILE = join(__dirname, "../data/history.json");

/**
 * Finds the most recent Pending history entry for a given user+service and
 * updates its status. Used by admin serve/remove actions to keep history accurate.
 */
function resolvePendingHistory(userId, serviceId, outcome) {
  try {
    const history = JSON.parse(readFileSync(HISTORY_FILE, "utf-8"));
    const index = history.findIndex(
      (e) => e.userId === userId && e.serviceId === serviceId && e.status === "Pending"
    );
    if (index !== -1) {
      history[index].status = outcome;
      writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
    }
  } catch { /* non-critical — history update should not fail a queue operation */ }
}

/**
 * Reads and parses the queue JSON file from disk.
 * @returns {Array} Full array of all queue entries across all services.
 */
function readQueue() {
  return JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
}

/**
 * Serializes and writes the full queue array back to disk.
 * @param {Array} queue - The updated full queue to persist.
 */
function writeQueue(queue) {
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Returns the queue for a specific service, in order.
 * @param {import('express').Request} req - Params: { serviceId }
 * @param {import('express').Response} res - 200 with the service's queue array.
 */
export function getQueue(req, res) {
  const { serviceId } = req.params;
  const queue = readQueue().filter((entry) => entry.serviceId === serviceId);
  return res.status(200).json(queue);
}

/**
 * Serves the next user in a service's queue: removes the first entry for that service.
 * @param {import('express').Request} req - Params: { serviceId }
 * @param {import('express').Response} res - 200 with the served entry, 404 if queue is empty.
 */
export function serveNext(req, res) {
  const { serviceId } = req.params;
  const all = readQueue();

  const firstIndex = all.findIndex((entry) => entry.serviceId === serviceId);
  if (firstIndex === -1) {
    return res.status(404).json({ message: "Queue is empty for this service." });
  }

  const [served] = all.splice(firstIndex, 1);
  writeQueue(all);
  resolvePendingHistory(served.userId, served.serviceId, "Completed");

  return res.status(200).json(served);
}

/**
 * Removes a specific entry from a service's queue by entry ID.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 on success, 404 if not found.
 */
export function removeFromQueue(req, res) {
  const { serviceId, entryId } = req.params;
  const all = readQueue();

  const index = all.findIndex(
    (entry) => entry.id === entryId && entry.serviceId === serviceId
  );

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found in queue." });
  }

  const removed = all[index];
  all.splice(index, 1);
  writeQueue(all);
  resolvePendingHistory(removed.userId, removed.serviceId, "Cancelled");

  return res.status(200).json({ message: "Removed from queue." });
}

/**
 * Moves an entry one position toward the front within its service's queue.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 with updated service queue, 400 if already at front, 404 if not found.
 */
export function moveUp(req, res) {
  const { serviceId, entryId } = req.params;
  const all = readQueue();

  // Collect indices of entries belonging to this service
  const serviceIndices = all.reduce((acc, entry, i) => {
    if (entry.serviceId === serviceId) acc.push(i);
    return acc;
  }, []);

  const posInService = serviceIndices.findIndex(
    (i) => all[i].id === entryId
  );

  if (posInService === -1) {
    return res.status(404).json({ message: "Entry not found in queue." });
  }

  if (posInService === 0) {
    return res.status(400).json({ message: "Entry is already at the front." });
  }

  // Swap with the previous entry in this service's slice of the global array
  const idxA = serviceIndices[posInService - 1];
  const idxB = serviceIndices[posInService];
  [all[idxA], all[idxB]] = [all[idxB], all[idxA]];
  writeQueue(all);

  return res.status(200).json(all.filter((e) => e.serviceId === serviceId));
}

/**
 * Adds the authenticated user to a service's queue.
 * @param {import('express').Request} req - Params: { serviceId }. Body: { priority }
 * @param {import('express').Response} res - 201 with the new entry, 400 if already in queue.
 */
export function joinQueue(req, res) {
  const { serviceId } = req.params;
  const { priority } = req.body;
  const userId = req.user.id;
  const name = req.user.name || req.user.username;

  const all = readQueue();

  const existing = all.find((e) => e.serviceId === serviceId && e.userId === userId);
  if (existing) {
    return res.status(400).json({ message: "Already in this queue." });
  }

  const entry = {
    id: randomUUID(),
    serviceId,
    userId,
    name,
    priority: priority || "Low",
    date: new Date().toISOString(),
    status: "Waiting",
  };

  all.push(entry);
  writeQueue(all);

  return res.status(201).json(entry);
}

/**
 * Removes the authenticated user's entry from a service's queue.
 * @param {import('express').Request} req - Params: { serviceId, entryId }
 * @param {import('express').Response} res - 200 on success, 404 if not found.
 */
export function leaveQueue(req, res) {
  const { serviceId, entryId } = req.params;
  const userId = req.user.id;

  const all = readQueue();
  const index = all.findIndex(
    (e) => e.id === entryId && e.serviceId === serviceId && e.userId === userId
  );

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found." });
  }

  const left = all[index];
  all.splice(index, 1);
  writeQueue(all);
  resolvePendingHistory(left.userId, left.serviceId, "Cancelled");

  return res.status(200).json({ message: "Left queue." });
}

/**
 * Returns all queue entries belonging to the authenticated user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with array of user's queue entries.
 */
export function getMyQueues(req, res) {
  const userId = req.user.id;
  const entries = readQueue().filter((e) => e.userId === userId);
  return res.status(200).json(entries);
}
