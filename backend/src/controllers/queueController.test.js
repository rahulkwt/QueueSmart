import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import {
  getQueue,
  serveNext,
  removeFromQueue,
  moveUp,
  joinQueue,
  leaveQueue,
  getMyQueues,
} from "./queueController.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json   = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => vi.clearAllMocks());

// ---------------------------------------------------------------------------
// getQueue
// ---------------------------------------------------------------------------
describe("getQueue", () => {
  it("returns pending entries for the service with status 200", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { id: 1, name: "Sam Smith",  position: 3, priority: "low" },
        { id: 2, name: "Jane Doe",   position: 4, priority: "low" },
      ],
    });
    const res = mockRes();
    await getQueue({ params: { serviceId: "1" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty("name");
  });

  it("returns empty array when no pending entries exist", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = mockRes();
    await getQueue({ params: { serviceId: "999" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getQueue({ params: { serviceId: "1" } }, res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// serveNext
// ---------------------------------------------------------------------------
describe("serveNext", () => {
  it("returns 404 when queue is empty", async () => {
    pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
    const res = mockRes();
    await serveNext({ params: { serviceId: "1" } }, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 with the served entry", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 3, user_id: 7 }] })
      .mockResolvedValueOnce({ rowCount: 1 });
    const res = mockRes();
    await serveNext({ params: { serviceId: "1" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.entryId).toBe(3);
    expect(res.body.userId).toBe(7);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await serveNext({ params: { serviceId: "1" } }, res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// removeFromQueue
// ---------------------------------------------------------------------------
describe("removeFromQueue", () => {
  it("returns 404 when entry is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = mockRes();
    await removeFromQueue({ params: { serviceId: "1", entryId: "999" } }, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 when entryId belongs to a different service", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = mockRes();
    await removeFromQueue({ params: { serviceId: "2", entryId: "1" } }, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 on successful removal", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ entry_id: 3 }] })
      .mockResolvedValueOnce({ rowCount: 1 });
    const res = mockRes();
    await removeFromQueue({ params: { serviceId: "1", entryId: "3" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Removed from queue.");
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await removeFromQueue({ params: { serviceId: "1", entryId: "3" } }, res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// moveUp
// ---------------------------------------------------------------------------
describe("moveUp", () => {
  it("returns 404 when entry is not found", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ entry_id: 1, queue_entry_position: 1 }, { entry_id: 2, queue_entry_position: 2 }],
    });
    const res = mockRes();
    await moveUp({ params: { serviceId: "1", entryId: "999" } }, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when entry is already at the front", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ entry_id: 3, queue_entry_position: 1 }],
    });
    const res = mockRes();
    await moveUp({ params: { serviceId: "1", entryId: "3" } }, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 with updated queue after a successful swap", async () => {
    pool.query
      .mockResolvedValueOnce({
        rows: [
          { entry_id: 3, queue_entry_position: 3 },
          { entry_id: 4, queue_entry_position: 4 },
        ],
      })
      .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE entry4 pos
      .mockResolvedValueOnce({ rowCount: 1 }) // UPDATE entry3 pos
      .mockResolvedValueOnce({
        rows: [
          { entry_id: 4, user_id: 2, queue_entry_position: 3, queue_priority: "low", queue_entry_status: "pending" },
          { entry_id: 3, user_id: 1, queue_entry_position: 4, queue_priority: "low", queue_entry_status: "pending" },
        ],
      });
    const res = mockRes();
    await moveUp({ params: { serviceId: "1", entryId: "4" } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].id).toBe(4);
    expect(res.body[1].id).toBe(3);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await moveUp({ params: { serviceId: "1", entryId: "3" } }, res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// joinQueue
// ---------------------------------------------------------------------------
describe("joinQueue", () => {
  const req = (serviceId, priority, userId) => ({
    params: { serviceId },
    body: { priority },
    user: { id: userId },
  });

  it("returns 404 when no active queue exists for the service", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const res = mockRes();
    await joinQueue(req("999", "low", 3), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when the user is already pending in the queue", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ queue_id: 1 }] })
      .mockResolvedValueOnce({ rows: [{ entry_id: 5 }] });
    const res = mockRes();
    await joinQueue(req("1", "low", 5), res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 201 with the new entry on valid input", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [{ queue_id: 1 }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ next_pos: 4 }] })
      .mockResolvedValueOnce({
        rows: [{ entry_id: 10, user_id: 3, service_id: 1, queue_priority: "low", queue_entry_status: "pending", queue_entry_position: 4, queue_join_time: "2026-04-08T00:00:00Z" }],
      });
    const res = mockRes();
    await joinQueue(req("1", "low", 3), res);
    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(10);
    expect(res.body.position).toBe(4);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await joinQueue(req("1", "low", 3), res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// leaveQueue
// ---------------------------------------------------------------------------
describe("leaveQueue", () => {
  const req = (serviceId, entryId, userId) => ({
    params: { serviceId, entryId },
    user: { id: userId },
  });

  it("returns 404 when entry is not found or not owned by the user", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = mockRes();
    await leaveQueue(req("1", "999", 3), res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 on success", async () => {
    pool.query.mockResolvedValue({ rows: [{ entry_id: 3 }] });
    const res = mockRes();
    await leaveQueue(req("1", "3", 5), res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Left queue.");
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await leaveQueue(req("1", "3", 5), res);
    expect(res.statusCode).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// getMyQueues
// ---------------------------------------------------------------------------
describe("getMyQueues", () => {
  it("returns the user's pending entries with status 200", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { entry_id: 6, service_id: 2, queue_entry_status: "pending", queue_entry_position: 2, queue_priority: "mid", queue_join_time: "2026-04-08T00:00:00Z" },
      ],
    });
    const res = mockRes();
    await getMyQueues({ user: { id: 4 } }, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(6);
    expect(res.body[0].serviceId).toBe(2);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getMyQueues({ user: { id: 4 } }, res);
    expect(res.statusCode).toBe(500);
  });
});
