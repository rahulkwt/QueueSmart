import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { getReports } from "./reportsController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

const makeReq = (query = {}) => ({ query });

const sampleRows = [
  { entry_id: 1, queue_entry_status: "completed", queue_entry_position: 1, queue_priority: "low",  queue_join_time: "2026-01-15", user_full_name: "Alice", service_name: "General" },
  { entry_id: 2, queue_entry_status: "cancelled", queue_entry_position: 2, queue_priority: "high", queue_join_time: "2026-01-16", user_full_name: "Bob",   service_name: "General" },
  { entry_id: 3, queue_entry_status: "pending",   queue_entry_position: 3, queue_priority: "mid",  queue_join_time: "2026-01-17", user_full_name: "Cara",  service_name: "Emergency" },
  { entry_id: 4, queue_entry_status: "completed", queue_entry_position: 4, queue_priority: "low",  queue_join_time: "2026-01-18", user_full_name: "Dan",   service_name: "Emergency" },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getReports", () => {
  it("returns all entries and a correct summary when no filters are provided", async () => {
    pool.query.mockResolvedValue({ rows: sampleRows });
    const res = mockRes();
    await getReports(makeReq(), res);

    expect(res.body.entries).toHaveLength(4);
    expect(res.body.entries[0]).toEqual({
      id: 1, patient: "Alice", service: "General", status: "completed",
      priority: "low", position: 1, joinedAt: "2026-01-15",
    });
    expect(res.body.summary).toEqual({ total: 4, completed: 2, cancelled: 1, pending: 1 });
  });

  it("issues a query with no WHERE clause when no filters are given", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(makeReq(), mockRes());

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).not.toMatch(/WHERE/);
    expect(params).toEqual([]);
  });

  it("adds a 'from' filter when provided", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(makeReq({ from: "2026-01-01" }), mockRes());

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/queue_join_time >= \$1::date/);
    expect(params).toEqual(["2026-01-01"]);
  });

  it("adds a 'to' filter as an exclusive next-day bound", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(makeReq({ to: "2026-01-31" }), mockRes());

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/< \(\$1::date \+ interval '1 day'\)/);
    expect(params).toEqual(["2026-01-31"]);
  });

  it("adds a serviceId filter", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(makeReq({ serviceId: "7" }), mockRes());

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/e\.service_id = \$1/);
    expect(params).toEqual(["7"]);
  });

  it("adds a status filter", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(makeReq({ status: "completed" }), mockRes());

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/e\.queue_entry_status = \$1/);
    expect(params).toEqual(["completed"]);
  });

  it("combines multiple filters in order with correct positional params", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    await getReports(
      makeReq({ from: "2026-01-01", to: "2026-01-31", serviceId: "2", status: "pending" }),
      mockRes()
    );

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toMatch(/WHERE/);
    expect(sql).toMatch(/\$1::date.*\$2::date.*\$3.*\$4/s);
    expect(params).toEqual(["2026-01-01", "2026-01-31", "2", "pending"]);
  });

  it("returns an empty list and zeroed summary when no rows match", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const res = mockRes();
    await getReports(makeReq({ status: "completed" }), res);

    expect(res.body.entries).toEqual([]);
    expect(res.body.summary).toEqual({ total: 0, completed: 0, cancelled: 0, pending: 0 });
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getReports(makeReq(), res);

    expect(res.statusCode).toBe(500);
    expect(res.body.message).toMatch(/Internal server error/);
  });
});
