import { describe, it, expect } from "vitest";
import pool from "../db.js";
import { getHistory, addHistory, deleteHistory, updateHistoryEntry } from "./historyController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

// carterm (user_id 50) has exactly one history record in the seed:
// (50, 6, 'Dental Checkup', NULL, 'completed').
const TEST_USER_ID = 50;

describe("history integration", () => {
  describe("getHistory", () => {
    it("returns only the authenticated user's history records", async () => {
      const res = mockRes();
      await getHistory({ user: { id: TEST_USER_ID } }, res);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      for (const entry of res.body) {
        expect(entry.userId).toBe(TEST_USER_ID);
      }
    });
  });

  describe("addHistory", () => {
    it("inserts a new history row for the authenticated user", async () => {
      const req = {
        user: { id: TEST_USER_ID },
        body: { service: "Lab Tests", serviceId: 3, status: "pending" },
      };
      const res = mockRes();
      await addHistory(req, res);
      expect(res.statusCode).toBe(201);
      expect(res.body.userId).toBe(TEST_USER_ID);
      expect(res.body.service).toBe("Lab Tests");

      const { rows } = await pool.query(
        "SELECT history_status FROM history WHERE history_id = $1",
        [res.body.id]
      );
      expect(rows[0].history_status).toBe("pending");
    });
  });

  describe("updateHistoryEntry", () => {
    it("updates the status of an owned record", async () => {
      const insert = await pool.query(
        `INSERT INTO history (user_id, service_id, history_service_name, history_status)
         VALUES ($1, 1, 'General Consultation', 'pending') RETURNING history_id`,
        [TEST_USER_ID]
      );
      const id = insert.rows[0].history_id;

      const res = mockRes();
      await updateHistoryEntry(
        { params: { id: String(id) }, user: { id: TEST_USER_ID }, body: { status: "completed" } },
        res
      );
      expect(res.body.status).toBe("Completed");

      const { rows } = await pool.query(
        "SELECT history_status FROM history WHERE history_id = $1",
        [id]
      );
      expect(rows[0].history_status).toBe("completed");
    });

    it("returns 403 when caller does not own the record", async () => {
      const insert = await pool.query(
        `INSERT INTO history (user_id, service_id, history_service_name, history_status)
         VALUES ($1, 1, 'General Consultation', 'pending') RETURNING history_id`,
        [TEST_USER_ID]
      );
      const id = insert.rows[0].history_id;

      const res = mockRes();
      await updateHistoryEntry(
        { params: { id: String(id) }, user: { id: 999 }, body: { status: "completed" } },
        res
      );
      expect(res.statusCode).toBe(403);
    });
  });

  describe("deleteHistory", () => {
    it("removes a record by id", async () => {
      const insert = await pool.query(
        `INSERT INTO history (user_id, service_id, history_service_name, history_status)
         VALUES ($1, 2, 'Emergency Care', 'completed') RETURNING history_id`,
        [TEST_USER_ID]
      );
      const id = insert.rows[0].history_id;

      const res = mockRes();
      await deleteHistory({ params: { id: String(id) } }, res);
      expect(res.body.deleted.id).toBe(id);

      const { rows } = await pool.query(
        "SELECT 1 FROM history WHERE history_id = $1",
        [id]
      );
      expect(rows).toHaveLength(0);
    });

    it("returns 404 for a non-existent id", async () => {
      const res = mockRes();
      await deleteHistory({ params: { id: "999999" } }, res);
      expect(res.statusCode).toBe(404);
    });
  });
});
