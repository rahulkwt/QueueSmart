/**
 * Estimates wait time based on queue position and avg service duration.
 * @param {number} position - The user's 0-based effective position in the queue
 * @param {number} avgServiceDuration - Average minutes per patient
 * @param {boolean} isOpen - Whether the service is currently open
 *
 * @returns {number|null} - Estimated wait in minutes, or null if service is closed
 * @throws {Error} - If any input is invalid
 */
export const estimateWaitTime = (position, avgServiceDuration, isOpen) => {
  if (typeof isOpen !== "boolean") {
    throw new Error("isOpen must be a boolean");
  }
  if (typeof position !== "number" || !Number.isFinite(position)) {
    throw new Error("position must be a finite number");
  }
  if (typeof avgServiceDuration !== "number" || !Number.isFinite(avgServiceDuration)) {
    throw new Error("avgServiceDuration must be a finite number");
  }
  if (position < 0) {
    throw new Error("position cannot be negative");
  }
  if (avgServiceDuration <= 0) {
    throw new Error("avgServiceDuration must be greater than 0");
  }

  if (!isOpen) return null;
  if (position === 0) return 0;

  return position * avgServiceDuration;
};

