import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from "fs";
import { getQueue, serveNext, removeFromQueue, moveUp } from "./queueController.js";

const mockQueue = [
  { id: "e1", name: "Alice", serviceId: "svc-1" },
  { id: "e2", name: "Bob", serviceId: "svc-1" },
  { id: "e3", name: "Carol", serviceId: "svc-2" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  readFileSync.mockReturnValue(JSON.stringify(mockQueue));
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
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved.find((e) => e.id === "e1")).toBeUndefined();
    expect(saved).toHaveLength(2);
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
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved.find((e) => e.id === "e1")).toBeUndefined();
    expect(saved).toHaveLength(2);
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
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    const svc2Entry = saved.find((e) => e.serviceId === "svc-2");
    expect(svc2Entry.id).toBe("e3");
  });
});
