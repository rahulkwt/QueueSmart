import { describe, it, expect, vi, beforeEach } from "vitest";
import { computeEffectiveQueue } from "./waitTimeController.js";

// Mock the DB pool so getWaitTime never touches a real database
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
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
  const SERVICE = "1";

  // Accepts DB-shaped rows: { entry_id, queue_priority, user_full_name }
  function setQueue(rows) {
    pool.query.mockResolvedValue({ rows });
  }

  beforeEach(() => {
    vi.clearAllMocks();
    setQueue([]);
  });

  it("returns wait times for all entries in a service queue", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
      { entry_id: 2, queue_priority: "low", user_full_name: "B" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.queue).toHaveLength(2);
    expect(res.body.queue[0]).toMatchObject({ entryId: "1", position: 0, estimatedWaitMinutes: 0 });
    expect(res.body.queue[1]).toMatchObject({ entryId: "2", position: 1, estimatedWaitMinutes: 10 });
  });

  it("uses custom avgDuration", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
      { entry_id: 2, queue_priority: "low", user_full_name: "B" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "5" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.avgDuration).toBe(5);
    expect(res.body.queue[1].estimatedWaitMinutes).toBe(5);
  });

  it("returns single entry when entryId is provided", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
      { entry_id: 2, queue_priority: "low", user_full_name: "B" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "2" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.entryId).toBe("2");
    expect(res.body.position).toBe(1);
    expect(res.body.estimatedWaitMinutes).toBe(10);
  });

  it("reflects priority skip in wait time", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
      { entry_id: 2, queue_priority: "low", user_full_name: "B" },
      { entry_id: 3, queue_priority: "high", user_full_name: "C" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "3", avgDuration: "10" } };
    const res = mockRes();
    await getWaitTime(req, res);

    // High skips 2 Low → effective position 0
    expect(res.body.position).toBe(0);
    expect(res.body.estimatedWaitMinutes).toBe(0);
  });

  it("maps mid priority to Medium for skip logic", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "mid", user_full_name: "A" },
      { entry_id: 2, queue_priority: "mid", user_full_name: "B" },
      { entry_id: 3, queue_priority: "high", user_full_name: "C" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "3", avgDuration: "10" } };
    const res = mockRes();
    await getWaitTime(req, res);

    // High skips 2 Medium → effective position 0
    expect(res.body.position).toBe(0);
    expect(res.body.estimatedWaitMinutes).toBe(0);
  });

  it("filters to only the requested service", async () => {
    // Pool is already scoped to serviceId by the SQL WHERE clause;
    // mock returns only the relevant rows
    setQueue([
      { entry_id: 2, queue_priority: "low", user_full_name: "A" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.queue).toHaveLength(1);
    expect(res.body.queue[0].entryId).toBe("2");
  });

  it("returns 404 when entryId is not found", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: { entryId: "missing" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("not found");
  });

  it("returns 400 when avgDuration is zero", async () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "0" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("avgDuration");
  });

  it("returns 400 when avgDuration is negative", async () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "-5" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when avgDuration is not a number", async () => {
    const req = { params: { serviceId: SERVICE }, query: { avgDuration: "abc" } };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.statusCode).toBe(400);
  });

  it("defaults avgDuration to 10", async () => {
    setQueue([
      { entry_id: 1, queue_priority: "low", user_full_name: "A" },
      { entry_id: 2, queue_priority: "low", user_full_name: "B" },
    ]);
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.avgDuration).toBe(10);
    expect(res.body.queue[1].estimatedWaitMinutes).toBe(10);
  });

  it("returns empty queue for unknown serviceId", async () => {
    setQueue([]);
    const req = { params: { serviceId: "nonexistent" }, query: {} };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.body.queue).toEqual([]);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB connection lost"));
    const req = { params: { serviceId: SERVICE }, query: {} };
    const res = mockRes();
    await getWaitTime(req, res);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain("Internal server error");
  });
});
