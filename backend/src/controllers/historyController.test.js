import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the DB pool so no real database is touched
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { getHistory, getHistoryByUser, addHistory, updateHistoryEntry, deleteHistory } from "./historyController.js";

// DB-shaped rows matching the history table schema
const mockRows = [
  {
    history_id: 1, user_id: 1, service_id: 1,
    history_service_name: "General Consultation",
    history_notes: null,
    history_time: "2026-01-15T00:00:00Z", history_status: "completed",
  },
  {
    history_id: 2, user_id: 2, service_id: 2,
    history_service_name: "Emergency Care",
    history_notes: null,
    history_time: "2026-02-01T00:00:00Z", history_status: "completed",
  },
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

// --- getHistory ---
describe("getHistory", () => {
  it("returns only history records for the authenticated user", async () => {
    pool.query.mockResolvedValue({ rows: [mockRows[0]] });
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getHistory(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe(1);
  });

  it("returns empty array when user has no history records", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 999 } };
    const res = mockRes();
    await getHistory(req, res);
    expect(res.body).toHaveLength(0);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getHistory(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- getHistoryByUser ---
describe("getHistoryByUser", () => {
  it("returns records for a valid userId", async () => {
    pool.query.mockResolvedValue({ rows: [mockRows[0]] });
    const req = { params: { userId: "1" } };
    const res = mockRes();
    await getHistoryByUser(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe(1);
  });

  it("returns empty array when userId has no records", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { params: { userId: "999" } };
    const res = mockRes();
    await getHistoryByUser(req, res);
    expect(res.body).toHaveLength(0);
  });

  it("returns 400 when userId is missing", async () => {
    const req = { params: { userId: "" } };
    const res = mockRes();
    await getHistoryByUser(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { params: { userId: "1" } };
    const res = mockRes();
    await getHistoryByUser(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- addHistory ---
describe("addHistory", () => {
  const validBody = {
    userId: 3,
    serviceId: 1,
    service: "General Consultation",
    status: "pending",
  };

  const newRow = {
    history_id: 3, user_id: 3, service_id: 1,
    history_service_name: "General Consultation",
    history_time: "2026-03-01T00:00:00Z", history_status: "pending",
    history_notes: null,
  };

  it("creates a new record with valid input", async () => {
    pool.query.mockResolvedValue({ rows: [newRow] });
    const req = { body: { ...validBody } };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe(3);
    expect(res.body.service).toBe("General Consultation");
  });

  it("uses req.user.id as userId when available", async () => {
    pool.query.mockResolvedValue({ rows: [{ ...newRow, user_id: 99 }] });
    const { userId, ...bodyWithoutUserId } = validBody;
    const req = { user: { id: 99 }, body: bodyWithoutUserId };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(pool.query.mock.calls[0][1][0]).toBe(99);
  });

  it("returns 400 when a required field is missing", async () => {
    const req = { body: { ...validBody, service: "" } };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("service");
  });

  it("returns 400 when serviceId is missing", async () => {
    const { serviceId, ...body } = validBody;
    const req = { body };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("serviceId");
  });

  it("returns 400 when status is not a valid value", async () => {
    const req = { body: { ...validBody, status: "Unknown" } };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("status");
  });

  it("returns 400 when service name exceeds 255 characters", async () => {
    const req = { body: { ...validBody, service: "x".repeat(256) } };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("service");
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { body: { ...validBody } };
    const res = mockRes();
    await addHistory(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- updateHistoryEntry ---
describe("updateHistoryEntry", () => {
  it("updates the status of an owned entry", async () => {
    const updatedRow = { ...mockRows[0], history_service_name: "General Consultation", history_notes: null, history_status: "completed" };
    pool.query
      .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })   // ownership check
      .mockResolvedValueOnce({ rows: [updatedRow] });        // update
    const req = { params: { id: "1" }, user: { id: 1 }, body: { status: "completed" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.body.status).toBe("Completed");
  });

  it("returns 403 when user does not own the entry", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });
    const req = { params: { id: "1" }, user: { id: 999 }, body: { status: "completed" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("returns 404 when entry is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { params: { id: "999" }, user: { id: 1 }, body: { status: "completed" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when status is invalid", async () => {
    const req = { params: { id: "1" }, user: { id: 1 }, body: { status: "Unknown" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when id is not a positive integer", async () => {
    const req = { params: { id: "0" }, user: { id: 1 }, body: { status: "completed" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { params: { id: "1" }, user: { id: 1 }, body: { status: "completed" } };
    const res = mockRes();
    await updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- deleteHistory ---
describe("deleteHistory", () => {
  it("deletes an existing record by id", async () => {
    pool.query.mockResolvedValue({ rows: [mockRows[0]] });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteHistory(req, res);
    expect(res.body.deleted.id).toBe(1);
  });

  it("returns 404 when record is not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { params: { id: "999" } };
    const res = mockRes();
    await deleteHistory(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("999");
  });

  it("returns 400 when id is not a number", async () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();
    await deleteHistory(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when id is zero or negative", async () => {
    const req = { params: { id: "0" } };
    const res = mockRes();
    await deleteHistory(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteHistory(req, res);
    expect(res.statusCode).toBe(500);
  });
});
