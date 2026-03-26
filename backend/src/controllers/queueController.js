import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "../data/queue.json");

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

  all.splice(index, 1);
  writeQueue(all);

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
