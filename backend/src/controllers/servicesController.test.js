import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the DB pool so no real database is touched
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { getServices, createService, updateService, deleteService } from "./servicesController.js";

// DB-shaped rows matching the services table schema
const mockServiceRows = [
  { service_id: 1, service_name: "General Consultation", service_description: "Standard check-up" },
  { service_id: 2, service_name: "Lab Work", service_description: "Blood tests and panels" },
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
    pool.query.mockResolvedValue({ rows: mockServiceRows });
    const req = {};
    const res = mockRes();
    await getServices(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
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

  it("returns 201 with new service on valid input", async () => {
    pool.query.mockResolvedValue({ rows: [{ service_id: 3, service_name: "X-Ray", service_description: "Imaging service" }] });
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    await createService(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("X-Ray");
    expect(res.body.id).toBeDefined();
  });

  it("persists new service to the database", async () => {
    pool.query.mockResolvedValue({ rows: [{ service_id: 3, service_name: "X-Ray", service_description: "Imaging service" }] });
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    await createService(req, res);
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO services"),
      expect.any(Array)
    );
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
    pool.query.mockResolvedValue({ rows: [] });
    const req = { params: { id: "999" }, body: { name: "X", description: "Y" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 with updated service on valid input", async () => {
    pool.query.mockResolvedValue({ rows: [{ service_id: 1, service_name: "Updated Name", service_description: "Updated desc" }] });
    const req = { params: { id: "1" }, body: { name: "Updated Name", description: "Updated desc" } };
    const res = mockRes();
    await updateService(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.id).toBe(1);
  });
});

// --- deleteService ---
describe("deleteService", () => {
  it("returns 404 when service is not found", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const req = { params: { id: "999" } };
    const res = mockRes();
    await deleteService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 and soft-deletes the service", async () => {
    pool.query.mockResolvedValue({ rows: [{ service_id: 1 }] });
    const req = { params: { id: "1" } };
    const res = mockRes();
    await deleteService(req, res);
    expect(res.statusCode).toBe(200);
    const updateCall = pool.query.mock.calls[0];
    expect(updateCall[0]).toContain("service_is_deleted = true");
  });
});
