import { vi, describe, it, expect, beforeEach } from "vitest";

// Mock the DB pool so no real database is touched
vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));

import pool from "../db.js";
import { register, login } from "./authController.js";

// DB-shaped row matching the users table schema
const mockUserRow = {
  user_id: 1,
  user_full_name: "Alice",
  user_email: "alice@test.com",
  user_username: "aliceuser",
  user_password: "password123",
  user_role: "user",
  user_token: "some-token",
};

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

beforeEach(() => {
  vi.clearAllMocks();
});

// --- register ---
describe("register", () => {
  it("returns 400 when required fields are missing", async () => {
    const req = { body: { name: "Test", email: "test@test.com" } };
    const res = mockRes();
    await register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("required");
  });

  it("returns 409 when email is already in use", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });
    const req = { body: { name: "Bob", email: "alice@test.com", username: "bobuser", password: "pass" } };
    const res = mockRes();
    await register(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("Email");
  });

  it("returns 409 when username is already taken", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });
    const req = { body: { name: "Bob", email: "bob@test.com", username: "aliceuser", password: "pass" } };
    const res = mockRes();
    await register(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("username");
  });

  it("returns 201 and saves new user with role 'user'", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })  // duplicate check
      .mockResolvedValueOnce({ rows: [] }); // INSERT
    const req = { body: { name: "Bob", email: "bob@test.com", username: "bobuser", password: "pass123" } };
    const res = mockRes();
    await register(req, res);
    expect(res.statusCode).toBe(201);
    const insertCall = pool.query.mock.calls[1];
    expect(insertCall[0]).toContain("'user'");
  });

  it("does not expose password in the response body", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { body: { name: "Bob", email: "bob@test.com", username: "bobuser", password: "pass123" } };
    const res = mockRes();
    await register(req, res);
    expect(res.body.password).toBeUndefined();
  });
});

// --- login ---
describe("login", () => {
  it("returns 400 when email or password is missing", async () => {
    const req = { body: { email: "alice@test.com" } };
    const res = mockRes();
    await login(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when user is not found", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });
    const req = { body: { email: "unknown@test.com", password: "pass" } };
    const res = mockRes();
    await login(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when password is incorrect", async () => {
    pool.query.mockResolvedValueOnce({ rows: [mockUserRow] });
    const req = { body: { email: "alice@test.com", password: "wrongpass" } };
    const res = mockRes();
    await login(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 200 with token on valid credentials", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockUserRow] }) // SELECT user
      .mockResolvedValueOnce({ rows: [] });            // UPDATE token
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    await login(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("does not include password in login response", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockUserRow] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    await login(req, res);
    expect(res.body.password).toBeUndefined();
  });

  it("persists the new token to the database on successful login", async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [mockUserRow] })
      .mockResolvedValueOnce({ rows: [] });
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    await login(req, res);
    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain("UPDATE users SET user_token");
    expect(updateCall[1][0]).toBe(res.body.token);
  });
});
