import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}));

import { readFileSync } from "fs";
import { verifyToken, verifyAdmin } from "./verifyToken.js";

const mockUsers = [
  { id: "user-1", name: "Alice", email: "alice@test.com", role: "user", token: "valid-user-token" },
  { id: "admin-1", name: "Admin", email: "admin@test.com", role: "admin", token: "valid-admin-token" },
];

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
  readFileSync.mockReturnValue(JSON.stringify(mockUsers));
});

// --- verifyToken ---
describe("verifyToken", () => {
  it("returns 401 when Authorization header is missing", () => {
    const req = { headers: {} };
    const res = mockRes();
    const next = vi.fn();
    verifyToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is not found in users", () => {
    const req = { headers: { authorization: "Bearer invalid-token" } };
    const res = mockRes();
    const next = vi.fn();
    verifyToken(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() and sets req.user on valid token", () => {
    const req = { headers: { authorization: "Bearer valid-user-token" } };
    const res = mockRes();
    const next = vi.fn();
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.id).toBe("user-1");
  });

  it("correctly identifies admin user from token", () => {
    const req = { headers: { authorization: "Bearer valid-admin-token" } };
    const res = mockRes();
    const next = vi.fn();
    verifyToken(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.role).toBe("admin");
  });
});

// --- verifyAdmin ---
describe("verifyAdmin", () => {
  it("returns 403 when user is not an admin", () => {
    const req = { user: { role: "user" } };
    const res = mockRes();
    const next = vi.fn();
    verifyAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() when user is an admin", () => {
    const req = { user: { role: "admin" } };
    const res = mockRes();
    const next = vi.fn();
    verifyAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 403 when req.user is undefined", () => {
    const req = {};
    const res = mockRes();
    const next = vi.fn();
    verifyAdmin(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });
});
