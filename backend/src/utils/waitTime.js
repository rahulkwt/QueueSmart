/**
 * Estimates wait time based on queue position and avg service duration
 * @param {number} position - The user's position in the queue
 * @param {number} avgServiceDuration - Average minutes per patient
 * @param {boolean} isOpen - Whether the service is currently open
 * 
 * @returns {number|null} - Estimated wait in minutes, or null if unavailable
 * @throws {Error}      -If any input is invalid
 */

export const estimateWaitTime = (position, avgServiceDuration, isOpen) => {
    
    //---Input validation---
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

  // --- Edge cases ---
  if (!isOpen) return null;       // Service is closed — no wait time available
  if (position === 0) return 0;   // Already being served

  // --- Core logic ---
  const waitMinutes = position * avgServiceDuration;
  return waitMinutes;
};