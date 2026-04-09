import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the DB pool so no real database is touched
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { getQueue, serveNext, removeFromQueue, moveUp } from "./queueController.js";

// DB-shaped rows matching queue_entry joined with users
const mockQueueRows = [
  { entry_id: 1, user_id: 1, user_full_name: "Alice", queue_priority: "low", queue_entry_status: "pending", queue_entry_position: 1, queue_join_time: "2026-01-01T00:00:00Z" },
  { entry_id: 2, user_id: 2, user_full_name: "Bob",   queue_priority: "low", queue_entry_status: "pending", queue_entry_position: 2, queue_join_time: "2026-01-01T00:00:00Z" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
});

// --- getQueue ---
describe("getQueue", () => {
  it("returns only entries for the given serviceId", async () => {
    pool.query.mockResolvedValue({ rows: mockQueueRows });
    const req = { params: { serviceId: "1" } };
    const res = mockRes();
    await getQueue(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((e) => e.serviceId === 1)).toBe(true);
  });

  it("returns empty array when no entries exist for serviceId", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { params: { serviceId: "999" } };
    const res = mockRes();
    await getQueue(req, res);
    expect(res.body).toHaveLength(0);
  });
});

// --- serveNext ---
describe("serveNext", () => {
  it("returns 404 when queue is empty for service", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "999" } };
    const res = mockRes();
    await serveNext(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns the first entry in the service queue", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 1, user_id: 1 }] }) // SELECT first pending
      .mockResolvedValueOnce({ rows: [] });                             // UPDATE to completed
    const req = { params: { serviceId: "1" } };
    const res = mockRes();
    await serveNext(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.entryId).toBe(1);
  });

  it("marks the entry as completed in the database", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 1, user_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "1" } };
    const res = mockRes();
    await serveNext(req, res);
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain("'completed'");
    expect(updateCall[1][0]).toBe(1);
  });

  it("returns the userId of the served entry", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 1, user_id: 42 }] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "1" } };
    const res = mockRes();
    await serveNext(req, res);
    expect(res.body.userId).toBe(42);
  });
});

// --- removeFromQueue ---
describe("removeFromQueue", () => {
  it("returns 404 when entry is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "1", entryId: "999" } };
    const res = mockRes();
    await removeFromQueue(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 when entryId belongs to a different serviceId", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "2", entryId: "1" } };
    const res = mockRes();
    await removeFromQueue(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("removes the correct entry and returns 200", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 1 }] }) // SELECT check
      .mockResolvedValueOnce({ rows: [] });                 // UPDATE to cancelled
    const req = { params: { serviceId: "1", entryId: "1" } };
    const res = mockRes();
    await removeFromQueue(req, res);
    expect(res.statusCode).toBe(200);
  });

  it("marks the removed entry as cancelled in the database", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 2 }] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { params: { serviceId: "1", entryId: "2" } };
    const res = mockRes();
    await removeFromQueue(req, res);
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain("'cancelled'");
    expect(updateCall[1][0]).toBe("2");
  });
});

// --- moveUp ---
describe("moveUp", () => {
  it("returns 404 when entry is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { entry_id: 1, queue_entry_position: 1 },
      { entry_id: 2, queue_entry_position: 2 },
    ]});
    const req = { params: { serviceId: "1", entryId: "999" } };
    const res = mockRes();
    await moveUp(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when entry is already at the front", async () => {
    pool.query.mockResolvedValueOnce({ rows: [
      { entry_id: 1, queue_entry_position: 1 },
      { entry_id: 2, queue_entry_position: 2 },
    ]});
    const req = { params: { serviceId: "1", entryId: "1" } };
    const res = mockRes();
    await moveUp(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("swaps entry with the one ahead of it", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [                            // SELECT ordered entries
        { entry_id: 1, queue_entry_position: 1 },
        { entry_id: 2, queue_entry_position: 2 },
      ]})
      .mockResolvedValueOnce({ rows: [] })                        // UPDATE entry 2 → position 1
      .mockResolvedValueOnce({ rows: [] })                        // UPDATE entry 1 → position 2
      .mockResolvedValueOnce({ rows: [                            // SELECT updated entries
        { entry_id: 2, user_id: 2, queue_entry_position: 1, queue_priority: "low", queue_entry_status: "pending" },
        { entry_id: 1, user_id: 1, queue_entry_position: 2, queue_priority: "low", queue_entry_status: "pending" },
      ]});
    const req = { params: { serviceId: "1", entryId: "2" } };
    const res = mockRes();
    await moveUp(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].id).toBe(2);
    expect(res.body[1].id).toBe(1);
  });

  it("does not affect entries from other services", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [
        { entry_id: 1, queue_entry_position: 1 },
        { entry_id: 2, queue_entry_position: 2 },
      ]})
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [
        { entry_id: 2, user_id: 2, queue_entry_position: 1, queue_priority: "low", queue_entry_status: "pending" },
        { entry_id: 1, user_id: 1, queue_entry_position: 2, queue_priority: "low", queue_entry_status: "pending" },
      ]});
    const req = { params: { serviceId: "1", entryId: "2" } };
    const res = mockRes();
    await moveUp(req, res);
    // Both SELECT queries should be scoped to serviceId "1", not any other service
    expect(pool.query.mock.calls[0][1][0]).toBe("1"); // initial SELECT
    expect(pool.query.mock.calls[3][1][0]).toBe("1"); // final SELECT
  });
});
