import { describe, it, expect } from "vitest";
import pool from "../db.js";
import {
  getNotifications,
  createNotification,
  markAllRead,
  clearAllNotifications,
} from "./notificationsData.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// johndoe (user_id 6) has 2 notifications in the seed.
const SEED_USER_ID = 6;
// Use a clean user (no notifications in seed) for create/clear tests.
const CLEAN_USER_ID = 49;

describe("notifications integration", () => {
  describe("getNotifications", () => {
    it("returns notifications for the authenticated user only", async () => {
      const res = mockRes();
      await getNotifications({ user: { id: SEED_USER_ID } }, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("createNotification", () => {
    it("inserts a new unread notification for the user", async () => {
      const res = mockRes();
      await createNotification(
        { user: { id: CLEAN_USER_ID }, body: { message: "Integration test notification." } },
        res
      );
      expect(res.statusCode).toBe(201);
      expect(res.body.notif_status).toBe("unread");
      expect(res.body.user_id).toBe(CLEAN_USER_ID);
    });

    it("returns 400 when message is missing", async () => {
      const res = mockRes();
      await createNotification({ user: { id: CLEAN_USER_ID }, body: {} }, res);
      expect(res.statusCode).toBe(400);
    });
  });

  describe("markAllRead", () => {
    it("marks every notification for the user as read", async () => {
      const res = mockRes();
      await markAllRead({ user: { id: SEED_USER_ID } }, res);
      expect(res.statusCode).toBe(200);

      const { rows } = await pool.query(
        "SELECT notif_status FROM notifications WHERE user_id = $1",
        [SEED_USER_ID]
      );
      for (const row of rows) {
        expect(row.notif_status).toBe("read");
      }
    });
  });

  describe("clearAllNotifications", () => {
    it("deletes every notification for the user", async () => {
      const res = mockRes();
      await clearAllNotifications({ user: { id: CLEAN_USER_ID } }, res);
      expect(res.statusCode).toBe(200);

      const { rows } = await pool.query(
        "SELECT 1 FROM notifications WHERE user_id = $1",
        [CLEAN_USER_ID]
      );
      expect(rows).toHaveLength(0);
    });
  });
});
