import { describe, it, expect, beforeEach } from "vitest";
import { getService, addService, leaveService } from "./serviceController.js";
import { serviceData } from "../mock/serviceData.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  serviceData.length = 0;
  serviceData.push(
    { id: 1, service: "General Consultation", doctor: "Dr. A", date: "01-01-2026", notes: "", status: "Pending", isActive: true, leftReason: null, leftBy: null },
    { id: 2, service: "Lab Work", doctor: "Dr. B", date: "01-02-2026", notes: "", status: "Completed", isActive: true, leftReason: null, leftBy: null },
    { id: 3, service: "General Consultation", doctor: "Dr. A", date: "01-03-2026", notes: "", status: "Pending", isActive: false, leftReason: "User left", leftBy: "user" }
  );
});

// --- getService ---
describe("getService", () => {
  it("returns only active and non-completed entries", () => {
    const req = { query: {} };
    const res = mockRes();
    getService(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(1);
  });

  it("filters by service name when provided in query", () => {
    serviceData.push({ id: 4, service: "X-Ray", doctor: "Dr. C", date: "01-04-2026", notes: "", status: "Pending", isActive: true, leftReason: null, leftBy: null });
    const req = { query: { service: "X-Ray" } };
    const res = mockRes();
    getService(req, res);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].service).toBe("X-Ray");
  });

  it("returns empty array when no active entries match the service name", () => {
    const req = { query: { service: "Nonexistent Service" } };
    const res = mockRes();
    getService(req, res);
    expect(res.body).toHaveLength(0);
  });
});

// --- addService ---
describe("addService", () => {
  it("adds a new entry and returns 201", () => {
    const req = { body: { service: "Emergency", doctor: "Dr. E", date: "01-05-2026", notes: "", status: "Pending" } };
    const res = mockRes();
    addService(req, res);
    expect(res.statusCode).toBe(201);
    expect(res.body.service).toBe("Emergency");
  });

  it("marks new entry as active", () => {
    const req = { body: { service: "Emergency", doctor: "Dr. E", date: "01-05-2026", notes: "", status: "Pending" } };
    const res = mockRes();
    addService(req, res);
    expect(res.body.isActive).toBe(true);
  });

  it("increments the data store length", () => {
    const req = { body: { service: "Emergency", doctor: "Dr. E", date: "01-05-2026", notes: "", status: "Pending" } };
    const res = mockRes();
    addService(req, res);
    expect(serviceData).toHaveLength(4);
  });
});

// --- leaveService ---
describe("leaveService", () => {
  it("returns 404 when entry is not found", () => {
    const req = { params: { id: "999" }, body: {} };
    const res = mockRes();
    leaveService(req, res);
    expect(res.statusCode).toBe(404);
  });

  it("marks entry as inactive on leave", () => {
    const req = { params: { id: "1" }, body: { leftReason: "Changed mind", leftBy: "user" } };
    const res = mockRes();
    leaveService(req, res);
    expect(res.body.isActive).toBe(false);
    expect(res.body.leftReason).toBe("Changed mind");
    expect(res.body.leftBy).toBe("user");
  });

  it("defaults status to 'Aborted' when not provided", () => {
    const req = { params: { id: "1" }, body: {} };
    const res = mockRes();
    leaveService(req, res);
    expect(res.body.status).toBe("Aborted");
  });

  it("uses provided status when given", () => {
    const req = { params: { id: "1" }, body: { status: "Cancelled" } };
    const res = mockRes();
    leaveService(req, res);
    expect(res.body.status).toBe("Cancelled");
  });
});
