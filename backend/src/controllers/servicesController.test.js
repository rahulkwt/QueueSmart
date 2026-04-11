import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import {
  getServices,
  getServicesWithCounts,
  createService,
  updateService,
  deleteService,
} from "./servicesController.js";

const mockRows = [
  { id: 1, name: "General Consultation", description: "Standard check-up" },
  { id: 2, name: "Lab Work", description: "Blood tests and panels" },
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

// --- getServices ---
describe("getServices", () => {
  it("returns all services with status 200", async () => {
    pool.query.mockResolvedValue({ rows: mockRows });
    const res = mockRes();
    await getServices({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getServices({}, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- getServicesWithCounts ---
describe("getServicesWithCounts", () => {
  it("returns services enriched with queueCount", async () => {
    const rowsWithCounts = mockRows.map((r, i) => ({ ...r, queueCount: i }));
    pool.query.mockResolvedValue({ rows: rowsWithCounts });
    const res = mockRes();
    await getServicesWithCounts({}, res);
    expect(res.statusCode).toBe(200);
    expect(res.body[0]).toHaveProperty("queueCount");
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const res = mockRes();
    await getServicesWithCounts({}, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- createService ---
describe("createService", () => {
  it("returns 400 when name is missing", async () => {
    const req = { body: { description: "A description" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when description is missing", async () => {
    const req = { body: { name: "New Service" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 201 with the new service on valid input", async () => {
    pool.query.mockResolvedValue({ rows: [{ id: 3, name: "X-Ray", description: "Imaging service" }] });
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("X-Ray");
    expect(res.body.id).toBeDefined();
  });

  it("returns 409 on duplicate service name", async () => {
    const dupErr = Object.assign(new Error("unique violation"), { code: "23505" });
    pool.query.mockRejectedValue(dupErr);
    const req = { body: { name: "General Consultation", description: "Duplicate" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(409);
  });

  it("returns 500 on unexpected database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(500);
  });
});

// --- updateService ---
describe("updateService", () => {
  it("returns 400 when name is missing", async () => {
    const req = { params: { id: "1" }, body: { description: "Updated" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when description is missing", async () => {
    const req = { params: { id: "1" }, body: { name: "Updated" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 404 when service is not found", async () => {
    pool.query.mockResolvedValue({ rowCount: 0, rows: [] });
    const req = { params: { id: "999" }, body: { name: "X", description: "Y" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 with updated service on valid input", async () => {
    pool.query.mockResolvedValue({
      rowCount: 1,
      rows: [{ id: 1, name: "Updated Name", description: "Updated desc" }],
    });
    const req = { params: { id: "1" }, body: { name: "Updated Name", description: "Updated desc" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.id).toBe(1);
  });

  it("returns 409 on duplicate service name", async () => {
    const dupErr = Object.assign(new Error("unique violation"), { code: "23505" });
    pool.query.mockRejectedValue(dupErr);
    const req = { params: { id: "1" }, body: { name: "Lab Work", description: "Conflict" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(409);
  });
});

// --- deleteService ---
describe("deleteService", () => {
  it("returns 404 when service is not found", async () => {
    pool.query.mockResolvedValue({ rowCount: 0 });
    const req = { params: { id: "999" } };
    const res = mockRes();
    await deleteService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 on successful soft-delete", async () => {
    pool.query.mockResolvedValue({ rowCount: 1 });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteService(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Service deleted.");
  });

  it("returns 500 on database error", async () => {
    pool.query.mockRejectedValue(new Error("DB error"));
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteService(req, res);
    expect(res.statusCode).toBe(500);
  });
});
