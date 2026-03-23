import { describe, it, expect } from "vitest";
import { getWaitTime } from "./waitTimeController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

describe("getWaitTime", () => {
  it("returns estimated wait time for valid inputs", () => {
    const req = { query: { position: "3", avgDuration: "10", isOpen: "true" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.body.estimatedWaitMinutes).toBe(30);
    expect(res.body.position).toBe(3);
  });

  it("returns 0 wait time when position is 0", () => {
    const req = { query: { position: "0", avgDuration: "10" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.body.estimatedWaitMinutes).toBe(0);
  });

  it("returns null when isOpen is false", () => {
    const req = { query: { position: "2", avgDuration: "10", isOpen: "false" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.body.estimatedWaitMinutes).toBeNull();
  });

  it("uses default avgDuration of 10 when not provided", () => {
    const req = { query: { position: "2" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.body.estimatedWaitMinutes).toBe(20);
    expect(res.body.avgDuration).toBe(10);
  });

  it("returns 400 when position is missing", () => {
    const req = { query: {} };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("position");
  });

  it("returns 400 when position is negative", () => {
    const req = { query: { position: "-1", avgDuration: "10" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when position is not a number", () => {
    const req = { query: { position: "abc", avgDuration: "10" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when avgDuration is zero", () => {
    const req = { query: { position: "2", avgDuration: "0" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain("avgDuration");
  });

  it("returns 400 when avgDuration is negative", () => {
    const req = { query: { position: "2", avgDuration: "-5" } };
    const res = mockRes();
    getWaitTime(req, res);
    expect(res.statusCode).toBe(400);
  });
});
