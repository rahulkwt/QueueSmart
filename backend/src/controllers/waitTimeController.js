import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const QUEUE_FILE = join(__dirname, "../data/queue.json");

/**
 * Builds the effective queue order by letting High-priority entries
 * skip ahead of up to 2 Low or Medium-priority entries that are in front of them.
 * Other High entries are never skipped. Medium entries cannot skip anyone.
 *
 * @param {Array} queue - FIFO-ordered queue entries for one service.
 * @returns {Array} Reordered queue reflecting priority skips.
 */
export function computeEffectiveQueue(queue) {
  const effective = [...queue];

  for (let i = 0; i < effective.length; i++) {
    if (effective[i].priority !== "High") continue;

    let skipped = 0;
    let pos = i;

    while (pos > 0 && skipped < 2) {
      if (effective[pos - 1].priority === "Low" || effective[pos - 1].priority === "Medium") {
        [effective[pos - 1], effective[pos]] = [effective[pos], effective[pos - 1]];
        pos--;
        skipped++;
      } else {
        break;
      }
    }
  }

  return effective;
}

/**
 * GET /api/queue/:serviceId/wait-time?avgDuration=10&entryId=xxx
 *
 * Computes estimated wait times for a service's queue, factoring in
 * priority-based reordering (High skips up to 2 Low entries).
 *
 * Query params:
 *   avgDuration - average service duration in minutes (default 10)
 *   entryId     - optional; if provided, returns only that entry's wait time
 */
export function getWaitTime(req, res) {
  const { serviceId } = req.params;
  const { avgDuration, entryId } = req.query;

  let duration = 10;
  if (avgDuration !== undefined) {
    duration = Number(avgDuration);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "avgDuration must be a positive number." });
    }
  }

  const allEntries = JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
  const serviceQueue = allEntries.filter((e) => e.serviceId === serviceId);

  const effectiveQueue = computeEffectiveQueue(serviceQueue);

  if (entryId) {
    const position = effectiveQueue.findIndex((e) => e.id === entryId);
    if (position === -1) {
      return res.status(404).json({ error: "Entry not found in this service's queue." });
    }
    return res.json({
      entryId,
      position,
      estimatedWaitMinutes: position * duration,
      avgDuration: duration,
    });
  }

  const waitTimes = effectiveQueue.map((entry, position) => ({
    entryId: entry.id,
    name: entry.name,
    priority: entry.priority,
    position,
    estimatedWaitMinutes: position * duration,
  }));

  return res.json({ serviceId, avgDuration: duration, queue: waitTimes });
}
