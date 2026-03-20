import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "../data/queue.json");

/**
 * Reads and parses the queue JSON file from disk.
 * @returns {Array} Ordered array of queue entries.
 */
function readQueue() {
  return JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
}

/**
 * Serializes and writes the queue array back to disk.
 * @param {Array} queue - The updated queue to persist.
 */
function writeQueue(queue) {
  writeFileSync(QUEUE_FILE, JSON.stringify(queue, null, 2));
}

/**
 * Returns the current queue in order.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with queue array.
 */
export function getQueue(req, res) {
  return res.status(200).json(readQueue());
}

/**
 * Serves the next user: removes the first entry from the queue.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with the served entry, 404 if queue is empty.
 */
export function serveNext(req, res) {
  const queue = readQueue();

  if (queue.length === 0) {
    return res.status(404).json({ message: "Queue is empty." });
  }

  const [served, ...remaining] = queue;
  writeQueue(remaining);

  return res.status(200).json(served);
}

/**
 * Removes a specific entry from the queue by ID.
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res - 200 on success, 404 if not found.
 */
export function removeFromQueue(req, res) {
  const { id } = req.params;
  const queue = readQueue();
  const index = queue.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found in queue." });
  }

  const updated = queue.filter((entry) => entry.id !== id);
  writeQueue(updated);

  return res.status(200).json({ message: "Removed from queue." });
}

/**
 * Moves a queue entry one position earlier (toward the front).
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res - 200 with updated queue, 400 if already at front, 404 if not found.
 */
export function moveUp(req, res) {
  const { id } = req.params;
  const queue = readQueue();
  const index = queue.findIndex((entry) => entry.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Entry not found in queue." });
  }

  if (index === 0) {
    return res.status(400).json({ message: "Entry is already at the front." });
  }

  const updated = [...queue];
  [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
  writeQueue(updated);

  return res.status(200).json(updated);
}
