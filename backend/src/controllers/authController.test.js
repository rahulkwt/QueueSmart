import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

import { readFileSync, writeFileSync } from "fs";
import { register, login } from "./authController.js";

const mockUsers = [
  {
    id: "existing-id",
    name: "Alice",
    email: "alice@test.com",
    username: "aliceuser",
    password: "password123",
    role: "user",
    token: "some-token",
  },
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
  writeFileSync.mockImplementation(() => {});
});

// --- register ---
describe("register", () => {
  it("returns 400 when required fields are missing", () => {
    const req = { body: { name: "Test", email: "test@test.com" } };
    const res = mockRes();
    register(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain("required");
  });

  it("returns 409 when email is already in use", () => {
    const req = { body: { name: "Bob", email: "alice@test.com", username: "bobuser", password: "pass" } };
    const res = mockRes();
    register(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("Email");
  });

  it("returns 409 when username is already taken", () => {
    const req = { body: { name: "Bob", email: "bob@test.com", username: "aliceuser", password: "pass" } };
    const res = mockRes();
    register(req, res);
    expect(res.statusCode).toBe(409);
    expect(res.body.message).toContain("Username");
  });

  it("returns 201 and saves new user with role 'user'", () => {
    const req = { body: { name: "Bob", email: "bob@test.com", username: "bobuser", password: "pass123" } };
    const res = mockRes();
    register(req, res);
    expect(res.statusCode).toBe(201);
    expect(writeFileSync).toHaveBeenCalled();
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved).toHaveLength(2);
    expect(saved[1].role).toBe("user");
  });

  it("does not expose password in the response body", () => {
    const req = { body: { name: "Bob", email: "bob@test.com", username: "bobuser", password: "pass123" } };
    const res = mockRes();
    register(req, res);
    expect(res.body.password).toBeUndefined();
  });
});

// --- login ---
describe("login", () => {
  it("returns 400 when email or password is missing", () => {
    const req = { body: { email: "alice@test.com" } };
    const res = mockRes();
    login(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 401 when user is not found", () => {
    const req = { body: { email: "unknown@test.com", password: "pass" } };
    const res = mockRes();
    login(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 401 when password is incorrect", () => {
    const req = { body: { email: "alice@test.com", password: "wrongpass" } };
    const res = mockRes();
    login(req, res);
    expect(res.statusCode).toBe(401);
  });

  it("returns 200 with token on valid credentials", () => {
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    login(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("does not include password in login response", () => {
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    login(req, res);
    expect(res.body.password).toBeUndefined();
  });

  it("persists the new token to disk on successful login", () => {
    const req = { body: { email: "alice@test.com", password: "password123" } };
    const res = mockRes();
    login(req, res);
    expect(writeFileSync).toHaveBeenCalled();
    const saved = JSON.parse(writeFileSync.mock.calls[0][1]);
    expect(saved[0].token).toBe(res.body.token);
  });
});
