import { estimateWaitTime } from "../utils/waitTime.js";

const DEFAULT_AVG_DURATION = 10; // minutes per user

/**
 * GET /api/queue/wait-time?position=N&avgDuration=M&isOpen=true
 * Returns estimated wait time for a given queue position.
 * Queue ordering/priority is handled by the Queue Management module —
 * this endpoint expects the caller to pass the already-resolved position.
 */
export const getWaitTime = (req, res) => {
  const position = parseFloat(req.query.position);
  const avgDuration = req.query.avgDuration !== undefined ? parseFloat(req.query.avgDuration) : DEFAULT_AVG_DURATION;
  const isOpen = req.query.isOpen !== "false"; // defaults to true unless ?isOpen=false

  if (req.query.position === undefined || req.query.position === "") {
    return res.status(400).json({ error: "position is required" });
  }
  if (!Number.isFinite(position) || position < 0) {
    return res.status(400).json({ error: "position must be a non-negative number" });
  }
  if (!Number.isFinite(avgDuration) || avgDuration <= 0) {
    return res.status(400).json({ error: "avgDuration must be a positive number" });
  }

  const estimatedWaitMinutes = estimateWaitTime(position, avgDuration, isOpen);

  return res.json({
    position,
    avgDuration,
    isOpen,
    estimatedWaitMinutes,
  });
};
