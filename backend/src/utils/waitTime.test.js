import { describe, it, expect } from "vitest";
import { estimateWaitTime } from "./waitTime.js";

describe("estimateWaitTime", () => {
  // --- Input validation ---
  it("throws if isOpen is not a boolean", () => {
    expect(() => estimateWaitTime(1, 10, "yes")).toThrow("isOpen must be a boolean");
  });

  it("throws if position is not a number", () => {
    expect(() => estimateWaitTime("3", 10, true)).toThrow("position must be a finite number");
  });

  it("throws if position is Infinity", () => {
    expect(() => estimateWaitTime(Infinity, 10, true)).toThrow("position must be a finite number");
  });

  it("throws if avgServiceDuration is not a number", () => {
    expect(() => estimateWaitTime(1, "ten", true)).toThrow("avgServiceDuration must be a finite number");
  });

  it("throws if avgServiceDuration is NaN", () => {
    expect(() => estimateWaitTime(1, NaN, true)).toThrow("avgServiceDuration must be a finite number");
  });

  it("throws if position is negative", () => {
    expect(() => estimateWaitTime(-1, 10, true)).toThrow("position cannot be negative");
  });

  it("throws if avgServiceDuration is zero", () => {
    expect(() => estimateWaitTime(1, 0, true)).toThrow("avgServiceDuration must be greater than 0");
  });

  it("throws if avgServiceDuration is negative", () => {
    expect(() => estimateWaitTime(1, -5, true)).toThrow("avgServiceDuration must be greater than 0");
  });

  // --- Edge cases ---
  it("returns null when service is closed", () => {
    expect(estimateWaitTime(3, 10, false)).toBeNull();
  });

  it("returns 0 when position is 0 (user is being served)", () => {
    expect(estimateWaitTime(0, 10, true)).toBe(0);
  });

  // --- Core logic ---
  it("returns position * avgServiceDuration", () => {
    expect(estimateWaitTime(3, 10, true)).toBe(30);
  });

  it("returns correct wait time for position 1", () => {
    expect(estimateWaitTime(1, 15, true)).toBe(15);
  });

  it("works with decimal avgServiceDuration", () => {
    expect(estimateWaitTime(4, 7.5, true)).toBe(30);
  });
});
