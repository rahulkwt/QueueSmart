import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeEffectiveQueue } from "./waitTimeController.js";

// Mock fs so getWaitTime reads from a virtual queue file instead of disk
vi.mock("fs", () => ({
  readFileSync: vi.fn(() => JSON.stringify([])),
  writeFileSync: vi.fn(),
}));

import { readFileSync } from "fs";
import { getWaitTime } from "./waitTimeController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// ─── computeEffectiveQueue ───────────────────────────────────────────

describe("computeEffectiveQueue", () => {
  it("keeps order when all entries are Low priority", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "Low" },
      { id: "c", priority: "Low" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("High skips up to 2 Low entries", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "Low" },
      { id: "c", priority: "Low" },
      { id: "d", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "d", "b", "c"]);
  });

  it("High skips Medium entries", () => {
    const q = [
      { id: "a", priority: "Medium" },
      { id: "b", priority: "Medium" },
      { id: "c", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["c", "a", "b"]);
  });

  it("High skips a mix of Low and Medium", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "Medium" },
      { id: "c", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["c", "a", "b"]);
  });

  it("High is blocked by another High", () => {
    const q = [
      { id: "a", priority: "High" },
      { id: "b", priority: "Low" },
      { id: "c", priority: "Low" },
      { id: "d", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "d", "b", "c"]);
  });

  it("Medium does not skip anyone", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "Medium" },
      { id: "c", priority: "Low" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "b", "c"]);
  });

  it("High skips only 1 when only 1 skippable entry ahead", () => {
    const q = [
      { id: "a", priority: "High" },
      { id: "b", priority: "Low" },
      { id: "c", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "c", "b"]);
  });

  it("multiple Highs each skip correctly", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "High" },
      { id: "c", priority: "Medium" },
      { id: "d", priority: "High" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["b", "d", "a", "c"]);
  });

  it("High already at front stays put", () => {
    const q = [
      { id: "a", priority: "High" },
      { id: "b", priority: "Low" },
    ];
    expect(computeEffectiveQueue(q).map((e) => e.id)).toEqual(["a", "b"]);
  });

  it("returns empty array for empty queue", () => {
    expect(computeEffectiveQueue([])).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const q = [
      { id: "a", priority: "Low" },
      { id: "b", priority: "High" },
    ];
    const original = q.map((e) => e.id);
    computeEffectiveQueue(q);
    expect(q.map((e) => e.id)).toEqual(original);
  });
});

// ─── getWaitTime endpoint ────────────────────────────────────────────

describe("getWaitTime", () => {
  const SERVICE = "service-1";

  function setQueue(entries) {
    readFileSync.mockReturnValue(JSON.stringify(entries));
  }

  beforeEach(() => {
    readFileSync.mockReset();
    setQueue([]);
  });

  it("returns wait times for all entries in a service queue", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "B", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.queue).toHaveLength(2);
    expect(res.body.queue[0]).toMatchObject({ entryId: "e1", position: 0, estimatedWaitMinutes: 0 });
    expect(res.body.queue[1]).toMatchObject({ entryId: "e2", position: 1, estimatedWaitMinutes: 10 });
  });

  it("uses custom avgDuration", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "B", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "5" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.avgDuration).toBe(5);
    expect(res.body.queue[1].estimatedWaitMinutes).toBe(5);
  });

  it("returns single entry when entryId is provided", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "B", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "e2" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.entryId).toBe("e2");
    expect(res.body.position).toBe(1);
    expect(res.body.estimatedWaitMinutes).toBe(10);
  });

  it("reflects priority skip in wait time", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "B", priority: "Low" },
      { id: "e3", serviceId: SERVICE, name: "C", priority: "High" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "e3", avgDuration: "10" } };
    const res = mockRes();
    getWaitTime(req, res);

    // High skips 2 Low → effective position 0
    expect(res.body.position).toBe(0);
    expect(res.body.estimatedWaitMinutes).toBe(0);
  });

  it("filters to only the requested service", () => {
    setQueue([
      { id: "e1", serviceId: "other", name: "X", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "A", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.queue).toHaveLength(1);
    expect(res.body.queue[0].entryId).toBe("e2");
  });

  it("returns 404 when entryId is not found", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "missing" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("not found");
  });

  it("returns 400 when avgDuration is zero", () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "0" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("avgDuration");
  });

  it("returns 400 when avgDuration is negative", () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "-5" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when avgDuration is not a number", () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "abc" } };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("defaults avgDuration to 10", () => {
    setQueue([
      { id: "e1", serviceId: SERVICE, name: "A", priority: "Low" },
      { id: "e2", serviceId: SERVICE, name: "B", priority: "Low" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.avgDuration).toBe(10);
    expect(res.body.queue[1].estimatedWaitMinutes).toBe(10);
  });

  it("returns empty queue for unknown serviceId", () => {
    setQueue([]);
    const req = { params: { serviceId: "nonexistent" }, query: {} };
    const res = mockRes();
    getWaitTime(req, res);

    expect(res.body.queue).toEqual([]);
  });
});
