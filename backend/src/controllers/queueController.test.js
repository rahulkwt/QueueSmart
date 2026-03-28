import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from "fs";
import { getQueue, serveNext, removeFromQueue, moveUp } from "./queueController.js";

const mockQueue = [
  { id: "e1", name: "Alice", userId: "user-1", serviceId: "svc-1" },
  { id: "e2", name: "Bob",   userId: "user-2", serviceId: "svc-1" },
  { id: "e3", name: "Carol", userId: "user-3", serviceId: "svc-2" },
];

// Pending history entries that serveNext/removeFromQueue should resolve
const mockHistory = [
  { id: 1, userId: "user-1", serviceId: "svc-1", service: "Test", doctor: "", date: "01-01-2026", notes: "", status: "Pending" },
  { id: 2, userId: "user-3", serviceId: "svc-2", service: "Test", doctor: "", date: "01-01-2026", notes: "", status: "Pending" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  // Return the right data based on which file is being read
  readFileSync.mockImplementation((filePath) => {
    if (String(filePath).includes("history")) return JSON.stringify(mockHistory);
    return JSON.stringify(mockQueue);
  });
  writeFileSync.mockImplementation(() => {});
});

// --- getQueue ---
describe("getQueue", () => {
  it("returns only entries for the given serviceId", () => {
    const req = { params: { serviceId: "svc-1" } };
    const res = mockRes();
    getQueue(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body.every((e) => e.serviceId === "svc-1")).toBe(true);
  });

  it("returns empty array when no entries exist for serviceId", () => {
    const req = { params: { serviceId: "svc-999" } };
    const res = mockRes();
    getQueue(req, res);
    expect(res.body).toHaveLength(0);
  });
});

// --- serveNext ---
describe("serveNext", () => {
  it("returns 404 when queue is empty for service", () => {
    const req = { params: { serviceId: "svc-999" } };
    const res = mockRes();
    serveNext(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns the first entry in the service queue", () => {
    const req = { params: { serviceId: "svc-1" } };
    const res = mockRes();
    serveNext(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe("e1");
  });

  it("removes the served entry from the queue", () => {
    const req = { params: { serviceId: "svc-1" } };
    const res = mockRes();
    serveNext(req, res);
    const queueWrite = writeFileSync.mock.calls.find(([p]) => String(p).includes("queue"));
    const saved = JSON.parse(queueWrite[1]);
    expect(saved.find((e) => e.id === "e1")).toBeUndefined();
    expect(saved).toHaveLength(2);
  });

  it("updates the served user's pending history entry to Completed", () => {
    const req = { params: { serviceId: "svc-1" } };
    const res = mockRes();
    serveNext(req, res);
    const historyWrite = writeFileSync.mock.calls.find(([p]) => String(p).includes("history"));
    expect(historyWrite).toBeDefined();
    const savedHistory = JSON.parse(historyWrite[1]);
    expect(savedHistory.find((e) => e.userId === "user-1").status).toBe("Completed");
  });
});

// --- removeFromQueue ---
describe("removeFromQueue", () => {
  it("returns 404 when entry is not found", () => {
    const req = { params: { serviceId: "svc-1", entryId: "nonexistent" } };
    const res = mockRes();
    removeFromQueue(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 404 when entryId belongs to a different serviceId", () => {
    const req = { params: { serviceId: "svc-2", entryId: "e1" } };
    const res = mockRes();
    removeFromQueue(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("removes the correct entry and returns 200", () => {
    const req = { params: { serviceId: "svc-1", entryId: "e1" } };
    const res = mockRes();
    removeFromQueue(req, res);
    expect(res.statusCode).toBe(200);
    const queueWrite = writeFileSync.mock.calls.find(([p]) => String(p).includes("queue"));
    const saved = JSON.parse(queueWrite[1]);
    expect(saved.find((e) => e.id === "e1")).toBeUndefined();
    expect(saved).toHaveLength(2);
  });

  it("updates the removed user's pending history entry to Cancelled", () => {
    const req = { params: { serviceId: "svc-2", entryId: "e3" } };
    const res = mockRes();
    removeFromQueue(req, res);
    const historyWrite = writeFileSync.mock.calls.find(([p]) => String(p).includes("history"));
    expect(historyWrite).toBeDefined();
    const savedHistory = JSON.parse(historyWrite[1]);
    expect(savedHistory.find((e) => e.userId === "user-3").status).toBe("Cancelled");
  });
});

// --- moveUp ---
describe("moveUp", () => {
  it("returns 404 when entry is not found", () => {
    const req = { params: { serviceId: "svc-1", entryId: "nonexistent" } };
    const res = mockRes();
    moveUp(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 400 when entry is already at the front", () => {
    const req = { params: { serviceId: "svc-1", entryId: "e1" } };
    const res = mockRes();
    moveUp(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("swaps entry with the one ahead of it", () => {
    const req = { params: { serviceId: "svc-1", entryId: "e2" } };
    const res = mockRes();
    moveUp(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body[0].id).toBe("e2");
    expect(res.body[1].id).toBe("e1");
  });

  it("does not affect entries from other services", () => {
    const req = { params: { serviceId: "svc-1", entryId: "e2" } };
    const res = mockRes();
    moveUp(req, res);
    const queueWrite = writeFileSync.mock.calls.find(([p]) => String(p).includes("queue"));
    const saved = JSON.parse(queueWrite[1]);
    const svc2Entry = saved.find((e) => e.serviceId === "svc-2");
    expect(svc2Entry.id).toBe("e3");
  });
});
