import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from "fs";
import { getServices, createService, updateService, deleteService } from "./servicesController.js";

const mockServices = [
  { id: "svc-1", name: "General Consultation", description: "Standard check-up" },
  { id: "svc-2", name: "Lab Work", description: "Blood tests and panels" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  readFileSync.mockReturnValue(JSON.stringify(mockServices));
  writeFileSync.mockImplementation(() => {});
});

// --- getServices ---
describe("getServices", () => {
  it("returns all services with status 200", () => {
    const req = {};
    const res = mockRes();
    getServices(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});

// --- createService ---
describe("createService", () => {
  it("returns 400 when name is missing", () => {
    const req = { body: { description: "A description" } };
    const res = mockRes();
    createService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when description is missing", () => {
    const req = { body: { name: "New Service" } };
    const res = mockRes();
    createService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 201 with new service on valid input", () => {
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    createService(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.name).toBe("X-Ray");
    expect(res.body.id).toBeDefined();
  });

  it("persists new service to disk", () => {
    const req = { body: { name: "X-Ray", description: "Imaging service" } };
    const res = mockRes();
    createService(req, res);
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved).toHaveLength(3);
  });
});

// --- updateService ---
describe("updateService", () => {
  it("returns 400 when name is missing", () => {
    const req = { params: { id: "svc-1" }, body: { description: "Updated" } };
    const res = mockRes();
    updateService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when description is missing", () => {
    const req = { params: { id: "svc-1" }, body: { name: "Updated" } };
    const res = mockRes();
    updateService(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 404 when service is not found", () => {
    const req = { params: { id: "nonexistent" }, body: { name: "X", description: "Y" } };
    const res = mockRes();
    updateService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 with updated service on valid input", () => {
    const req = { params: { id: "svc-1" }, body: { name: "Updated Name", description: "Updated desc" } };
    const res = mockRes();
    updateService(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe("Updated Name");
    expect(res.body.id).toBe("svc-1");
  });
});

// --- deleteService ---
describe("deleteService", () => {
  it("returns 404 when service is not found", () => {
    const req = { params: { id: "nonexistent" } };
    const res = mockRes();
    deleteService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("returns 200 and removes service from disk", () => {
    const req = { params: { id: "svc-1" } };
    const res = mockRes();
    deleteService(req, res);
    expect(res.statusCode).toBe(200);
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved).toHaveLength(1);
    expect(saved.find((s) => s.id === "svc-1")).toBeUndefined();
  });
});
