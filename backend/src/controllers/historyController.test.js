import { describe, it, expect, beforeEach } from "vitest";
import { getHistory, getHistoryByUser, addHistory, deleteHistory } from "./historyController.js";
import * as store from "../mock/historyData.js";

// Helper: creates a mock Express res object
const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// Reset in-memory store before each test
beforeEach(() => {
  store.historyData.length = 0;
  store.historyData.push(
    { id: 1, userId: "P-001", service: "Consultation", doctor: "Dr. A", date: "01-01-2026", notes: "", status: "Completed" },
    { id: 2, userId: "P-002", service: "Lab Work", doctor: "Dr. B", date: "02-01-2026", notes: "", status: "Pending" }
  );
  store.idState.nextId = 3;
});

// --- getHistory ---
describe("getHistory", () => {
  it("returns all history records", () => {
    const req = {};
    const res = mockRes();
    getHistory(req, res);
    expect(res.body).toHaveLength(2);
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
    expect(store.historyData).toHaveLength(3);
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

// --- deleteHistory ---
describe("deleteHistory", () => {
  it("deletes an existing record by id", () => {
    const req = { params: { id: "1" } };
    const res = mockRes();
    deleteHistory(req, res);
    expect(res.body.deleted.id).toBe(1);
    expect(store.historyData).toHaveLength(1);
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
