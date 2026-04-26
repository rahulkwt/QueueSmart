import { describe, it, expect } from "vitest";
import pool from "../db.js";
import { getQueue, joinQueue, leaveQueue, getMyQueues } from "./queueController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// Use lilyp (user_id 45) — they have no pending queue entries in the seed,
// and service 7 (X-Ray Imaging) has pending positions 3 and 4 already.
const TEST_USER_ID = 45;
const TEST_SERVICE_ID = 7;

describe("queue integration", () => {
  describe("getQueue", () => {
    it("returns pending entries ordered by position", async () => {
      const res = mockRes();
      await getQueue({ params: { serviceId: String(TEST_SERVICE_ID) } }, res);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      // X-Ray queue has 2 pending entries from the seed (positions 3 and 4).
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      const positions = res.body.map((e) => e.position);
      expect(positions).toEqual([...positions].sort((a, b) => a - b));
    });
  });

  describe("joinQueue", () => {
    it("creates a queue_entry linked to a fresh history row", async () => {
      const req = {
        params: { serviceId: String(TEST_SERVICE_ID) },
        body: { priority: "Medium" },
        user: { id: TEST_USER_ID },
      };
      const res = mockRes();
      await joinQueue(req, res);

      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(TEST_USER_ID);
      expect(res.body.status).toBe("pending");
      expect(res.body.priority).toBe("Medium");

      const { rows: entryRows } = await pool.query(
        "SELECT history_id, queue_entry_status FROM queue_entry WHERE entry_id = $1",
        [res.body.id]
      );
      expect(entryRows).toHaveLength(1);
      expect(entryRows[0].queue_entry_status).toBe("pending");
      expect(entryRows[0].history_id).not.toBeNull();

      const { rows: histRows } = await pool.query(
        "SELECT user_id, history_status FROM history WHERE history_id = $1",
        [entryRows[0].history_id]
      );
      expect(histRows[0].user_id).toBe(TEST_USER_ID);
      expect(histRows[0].history_status).toBe("pending");
    });

    it("returns 400 when the user is already pending in this queue", async () => {
      const req = {
        params: { serviceId: String(TEST_SERVICE_ID) },
        body: { priority: "low" },
        user: { id: TEST_USER_ID },
      };
      const res = mockRes();
      await joinQueue(req, res);
      expect(res.statusCode).toBe(400);
    });

    it("returns 404 when the service has no active queue", async () => {
      const req = {
        params: { serviceId: "9999" },
        body: { priority: "low" },
        user: { id: TEST_USER_ID },
      };
      const res = mockRes();
      await joinQueue(req, res);
      expect(res.statusCode).toBe(404);
    });
  });

  describe("getMyQueues", () => {
    it("returns the authenticated user's pending entries", async () => {
      const res = mockRes();
      await getMyQueues({ user: { id: TEST_USER_ID } }, res);
      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].serviceId).toBe(TEST_SERVICE_ID);
    });
  });

  describe("leaveQueue", () => {
    it("cancels the user's pending entry", async () => {
      const { rows } = await pool.query(
        "SELECT entry_id FROM queue_entry WHERE user_id = $1 AND service_id = $2 AND queue_entry_status = 'pending'",
        [TEST_USER_ID, TEST_SERVICE_ID]
      );
      const entryId = rows[0].entry_id;

      const res = mockRes();
      await leaveQueue(
        { params: { serviceId: String(TEST_SERVICE_ID), entryId: String(entryId) }, user: { id: TEST_USER_ID } },
        res
      );
      expect(res.statusCode).toBe(200);

      const { rows: after } = await pool.query(
        "SELECT queue_entry_status FROM queue_entry WHERE entry_id = $1",
        [entryId]
      );
      expect(after[0].queue_entry_status).toBe("cancelled");
    });

    it("returns 404 when entry does not exist or is not owned by the user", async () => {
      const res = mockRes();
      await leaveQueue(
        { params: { serviceId: "1", entryId: "999999" }, user: { id: TEST_USER_ID } },
        res
      );
      expect(res.statusCode).toBe(404);
    });
  });
});
