import { describe, it, expect } from "vitest";
import pool from "../db.js";
import { register, login } from "./authController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

describe("auth integration", () => {
  describe("register", () => {
    it("creates a new user and persists it in the database", async () => {
      const req = { body: {
        name: "Integration Tester",
        email: "intg.register@itest.com",
        username: "intg_register",
        password: "TestPass123",
      }};
      const res = mockRes();
      await register(req, res);

      expect(res.statusCode).toBe(201);

      const { rows } = await pool.query(
        "SELECT user_id, user_full_name, user_role FROM users WHERE user_email = $1",
        ["intg.register@itest.com"]
      );
      expect(rows).toHaveLength(1);
      expect(rows[0].user_full_name).toBe("Integration Tester");
      expect(rows[0].user_role).toBe("user");
    });

    it("returns 409 when email or username is already in use", async () => {
      const req = { body: {
        name: "Duplicate",
        email: "john.doe@example.com",  // exists in seed
        username: "newusername",
        password: "x",
      }};
      const res = mockRes();
      await register(req, res);
      expect(res.statusCode).toBe(409);
    });

    it("returns 400 when required fields are missing", async () => {
      const req = { body: { name: "x", email: "x@x.com" } };
      const res = mockRes();
      await register(req, res);
      expect(res.statusCode).toBe(400);
    });
  });

  describe("login", () => {
    it("authenticates a seeded user and persists a fresh token", async () => {
      const req = { body: { email: "john.doe@example.com", password: "John1234" } };
      const res = mockRes();
      await login(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body.id).toBe(6);  // John Doe is user_id 6 in seed
      expect(res.body.role).toBe("user");
      expect(res.body.token).toBeDefined();

      const { rows } = await pool.query(
        "SELECT user_token FROM users WHERE user_id = $1",
        [6]
      );
      expect(rows[0].user_token).toBe(res.body.token);
    });

    it("returns 401 on wrong password", async () => {
      const req = { body: { email: "john.doe@example.com", password: "wrong" } };
      const res = mockRes();
      await login(req, res);
      expect(res.statusCode).toBe(401);
    });

    it("returns 401 when email does not exist", async () => {
      const req = { body: { email: "nobody@nowhere.com", password: "anything" } };
      const res = mockRes();
      await login(req, res);
      expect(res.statusCode).toBe(401);
    });
  });
});
