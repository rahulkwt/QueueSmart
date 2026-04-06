import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from "fs";
import { getHistory, getHistoryByUser, addHistory, updateHistoryEntry, deleteHistory } from "./historyController.js";

const mockHistory = [
  { id: 1, userId: "P-001", service: "Consultation", doctor: "Dr. A", date: "01-01-2026", notes: "", status: "Completed" },
  { id: 2, userId: "P-002", service: "Lab Work", doctor: "Dr. B", date: "02-01-2026", notes: "", status: "Pending" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  readFileSync.mockReturnValue(JSON.stringify(mockHistory));
  writeFileSync.mockImplementation(() => {});
});

// --- getHistory ---
describe("getHistory", () => {
  it("returns only history records for the authenticated user", () => {
    const req = { user: { id: "P-001" } };
    const res = mockRes();
    getHistory(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe("P-001");
  });

  it("returns empty array when user has no history records", () => {
    const req = { user: { id: "P-999" } };
    const res = mockRes();
    getHistory(req, res);
    expect(res.body).toHaveLength(0);
  });
});

// --- getHistoryByUser ---
describe("getHistoryByUser", () => {
  it("returns records for a valid userId", () => {
    const req = { params: { userId: "P-001" } };
    const res = mockRes();
    getHistoryByUser(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].userId).toBe("P-001");
  });

  it("returns empty array when userId has no records", () => {
    const req = { params: { userId: "P-999" } };
    const res = mockRes();
    getHistoryByUser(req, res);
    expect(res.body).toHaveLength(0);
  });

  it("returns 400 when userId is missing", () => {
    const req = { params: { userId: "" } };
    const res = mockRes();
    getHistoryByUser(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

// --- addHistory ---
describe("addHistory", () => {
  const validBody = {
    userId: "P-003",
    service: "Emergency",
    doctor: "Dr. C",
    date: "03-01-2026",
    notes: "All clear",
    status: "Completed",
  };

  it("creates a new record with valid input", () => {
    const req = { body: { ...validBody } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe("P-003");
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved).toHaveLength(3);
  });

  it("uses req.user.id as userId when available", () => {
    const { userId, ...bodyWithoutUserId } = validBody;
    const req = { user: { id: "P-from-token" }, body: bodyWithoutUserId };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.userId).toBe("P-from-token");
  });

  it("creates a record without doctor field, defaulting to empty string", () => {
    const { doctor, ...bodyWithoutDoctor } = validBody;
    const req = { body: bodyWithoutDoctor };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.doctor).toBe("");
  });

  it("stores serviceId when provided", () => {
    const req = { body: { ...validBody, serviceId: "svc-123" } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.serviceId).toBe("svc-123");
  });

  it("creates a Pending record for active queue sessions", () => {
    const req = { user: { id: "P-001" }, body: { service: "Emergency", serviceId: "svc-1", date: "03-01-2026", status: "Pending" } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe("Pending");
  });

  it("returns 400 when a required field is missing", () => {
    const req = { body: { ...validBody, service: "" } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("service");
  });

  it("returns 400 when date format is invalid", () => {
    const req = { body: { ...validBody, date: "2026-01-01" } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("MM-DD-YYYY");
  });

  it("returns 400 when status is not a valid value", () => {
    const req = { body: { ...validBody, status: "Unknown" } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("status");
  });

  it("returns 400 when notes exceed max length", () => {
    const req = { body: { ...validBody, notes: "x".repeat(301) } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("notes");
  });

  it("returns 400 when service exceeds 100 characters", () => {
    const req = { body: { ...validBody, service: "s".repeat(101) } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("service");
  });

  it("returns 400 when doctor exceeds 100 characters", () => {
    const req = { body: { ...validBody, doctor: "d".repeat(101) } };
    const res = mockRes();
    addHistory(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("doctor");
  });
});

// --- updateHistoryEntry ---
describe("updateHistoryEntry", () => {
  it("updates the status of an owned entry", () => {
    const req = { params: { id: "2" }, user: { id: "P-002" }, body: { status: "Completed" } };
    const res = mockRes();
    updateHistoryEntry(req, res);
    expect(res.body.status).toBe("Completed");
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved.find((e) => e.id === 2).status).toBe("Completed");
  });

  it("returns 403 when user does not own the entry", () => {
    const req = { params: { id: "1" }, user: { id: "P-999" }, body: { status: "Cancelled" } };
    const res = mockRes();
    updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(403);
  });

  it("returns 404 when entry is not found", () => {
    const req = { params: { id: "999" }, user: { id: "P-001" }, body: { status: "Cancelled" } };
    const res = mockRes();
    updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when status is invalid", () => {
    const req = { params: { id: "1" }, user: { id: "P-001" }, body: { status: "Unknown" } };
    const res = mockRes();
    updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when id is not a positive integer", () => {
    const req = { params: { id: "0" }, user: { id: "P-001" }, body: { status: "Cancelled" } };
    const res = mockRes();
    updateHistoryEntry(req, res);
    expect(res.statusCode).toBe(400);
  });
});

// --- deleteHistory ---
describe("deleteHistory", () => {
  it("deletes an existing record by id", () => {
    const req = { params: { id: "1" } };
    const res = mockRes();
    deleteHistory(req, res);
    expect(res.body.deleted.id).toBe(1);
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
  });

  it("returns 404 when record is not found", () => {
    const req = { params: { id: "999" } };
    const res = mockRes();
    deleteHistory(req, res);
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toContain("999");
  });

  it("returns 400 when id is not a number", () => {
    const req = { params: { id: "abc" } };
    const res = mockRes();
    deleteHistory(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when id is zero or negative", () => {
    const req = { params: { id: "0" } };
    const res = mockRes();
    deleteHistory(req, res);
    expect(res.statusCode).toBe(400);
  });
});
