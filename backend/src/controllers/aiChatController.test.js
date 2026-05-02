import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("../db.js", () => ({
  default: { query: vi.fn() },
}));
vi.mock("../../llama/llamaService.js", () => ({
  callGroq: vi.fn(),
}));

import pool from "../db.js";
import { callGroq } from "../../llama/llamaService.js";
import { handleChat } from "./aiChatController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

const makeReq = (body, role = "user") => ({ body, user: { role } });

beforeEach(() => {
  vi.clearAllMocks();
});

describe("handleChat", () => {
  it("returns 400 when message is missing", async () => {
    const res = mockRes();
    await handleChat(makeReq({}), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/message/);
  });

  it("returns 400 when message is empty string", async () => {
    const res = mockRes();
    await handleChat(makeReq({ message: "   " }), res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 when message is not a string", async () => {
    const res = mockRes();
    await handleChat(makeReq({ message: 42 }), res);
    expect(res.statusCode).toBe(400);
  });

  it("returns 200 with reply on valid message", async () => {
    pool.query.mockResolvedValue({
      rows: [
        { service_name: "General", pending_count: "3" },
        { service_name: "Emergency", pending_count: "1" },
      ],
    });
    callGroq.mockResolvedValue("Here is your answer.");
    const res = mockRes();
    await handleChat(makeReq({ message: "How many waiting?" }, "admin"), res);

    expect(res.body.reply).toBe("Here is your answer.");
    expect(callGroq).toHaveBeenCalledTimes(1);
    const [msg, history, role, dbContext] = callGroq.mock.calls[0];
    expect(msg).toBe("How many waiting?");
    expect(history).toEqual([]);
    expect(role).toBe("admin");
    expect(dbContext).toContain("General(3)");
    expect(dbContext).toContain("Total waiting: 4");
  });

  it("passes provided history through to callGroq", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    callGroq.mockResolvedValue("ok");
    const res = mockRes();
    const history = [{ role: "user", content: "hi" }];
    await handleChat(makeReq({ message: "again", history }), res);

    expect(callGroq.mock.calls[0][1]).toBe(history);
  });

  it("uses 'No services configured.' context when no services exist", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    callGroq.mockResolvedValue("ok");
    const res = mockRes();
    await handleChat(makeReq({ message: "status?" }), res);

    expect(callGroq.mock.calls[0][3]).toBe("No services configured.");
  });

  it("returns 500 when the DB query fails", async () => {
    pool.query.mockRejectedValue(new Error("DB down"));
    const res = mockRes();
    await handleChat(makeReq({ message: "hi" }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/AI service unavailable/);
  });

  it("returns 500 when callGroq fails", async () => {
    pool.query.mockResolvedValue({ rows: [] });
    callGroq.mockRejectedValue(new Error("LLM timeout"));
    const res = mockRes();
    await handleChat(makeReq({ message: "hi" }), res);
    expect(res.statusCode).toBe(500);
  });
});
