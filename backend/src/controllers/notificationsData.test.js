import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the DB pool so no real database is touched
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { getNotifications, createNotification, markAllRead, clearAllNotifications } from "./notificationsData.js";

const mockRows = [
  { notif_id: 1, notif_message: "You are next in queue.", notif_status: "unread", notif_time: "2026-01-15T00:00:00Z" },
  { notif_id: 2, notif_message: "Appointment completed.", notif_status: "read", notif_time: "2026-01-14T00:00:00Z" },
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

// --- getNotifications ---
describe("getNotifications", () => {
  it("returns all notifications for the authenticated user", async () => {
    pool.query.mockResolvedValue({ rows: mockRows });
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getNotifications(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("returns empty array when user has no notifications", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 999 } };
    const res = mockRes();
    await getNotifications(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { user: { id: 1 } };
    const res = mockRes();
    await getNotifications(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- createNotification ---
describe("createNotification", () => {
  it("creates a notification with valid input", async () => {
    const newRow = { notif_id: 3, notif_message: "New notification", notif_status: "unread", notif_time: "2026-03-01T00:00:00Z" };
    pool.query.mockResolvedValue({ rows: [newRow] });
    const req = { user: { id: 1 }, body: { message: "New notification" } };
    const res = mockRes();
    await createNotification(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.notif_message).toBe("New notification");
    expect(res.body.notif_status).toBe("unread");
  });

  it("returns 400 when message is missing", async () => {
    const req = { user: { id: 1 }, body: {} };
    const res = mockRes();
    await createNotification(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when message is empty string", async () => {
    const req = { user: { id: 1 }, body: { message: "" } };
    const res = mockRes();
    await createNotification(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { user: { id: 1 }, body: { message: "Test" } };
    const res = mockRes();
    await createNotification(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- markAllRead ---
describe("markAllRead", () => {
  it("marks all notifications as read and returns 200", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 1 } };
    const res = mockRes();
    await markAllRead(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("read");
  });

  it("calls UPDATE with the correct user id", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 42 } };
    const res = mockRes();
    await markAllRead(req, res);
    expect(pool.query.mock.calls[0][1][0]).toBe(42);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { user: { id: 1 } };
    const res = mockRes();
    await markAllRead(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- clearAllNotifications ---
describe("clearAllNotifications", () => {
  it("deletes all notifications and returns 200", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 1 } };
    const res = mockRes();
    await clearAllNotifications(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toContain("Cleared");
  });

  it("calls DELETE with the correct user id", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { user: { id: 7 } };
    const res = mockRes();
    await clearAllNotifications(req, res);
    expect(pool.query.mock.calls[0][1][0]).toBe(7);
  });

  it("returns 500 when database query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { user: { id: 1 } };
    const res = mockRes();
    await clearAllNotifications(req, res);
    expect(res.statusCode).toBe(500);
  });
});
