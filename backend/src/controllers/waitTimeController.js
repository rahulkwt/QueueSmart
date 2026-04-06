export function getWaitTime(req, res) {
  const { position, avgDuration, isOpen } = req.query;

  if (position === undefined || position === "") {
    return res.status(400).json({ error: "position is required." });
  }

  const pos = Number(position);
  if (isNaN(pos) || pos < 0) {
    return res.status(400).json({ error: "position must be a non-negative number." });
  }

  let duration = 10;
  if (avgDuration !== undefined) {
    duration = Number(avgDuration);
    if (isNaN(duration) || duration <= 0) {
      return res.status(400).json({ error: "avgDuration must be a positive number." });
    }
  }

  if (isOpen === "false") {
    return res.json({ estimatedWaitMinutes: null, position: pos, avgDuration: duration });
  }

  return res.json({
    estimatedWaitMinutes: pos * duration,
    position: pos,
    avgDuration: duration,
  });
}
