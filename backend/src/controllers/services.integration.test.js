import { describe, it, expect } from "vitest";
import pool from "../db.js";
import {
  getServices,
  getServicesWithCounts,
  createService,
  updateService,
  deleteService,
} from "./servicesController.js";

const mockRes = () => {
  const res = {};
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
};

describe("services integration", () => {
  describe("getServices", () => {
    it("returns only services that are not soft-deleted", async () => {
      const res = mockRes();
      await getServices({}, res);
      expect(res.statusCode).toBe(200);
      // Seed has 10 services; one (Specialist Referral) is soft-deleted.
      expect(res.body).toHaveLength(9);
      const names = res.body.map((s) => s.name);
      expect(names).not.toContain("Specialist Referral");
      expect(names).toContain("General Consultation");
    });
  });

  describe("getServicesWithCounts", () => {
    it("returns services with a numeric pending queue count", async () => {
      const res = mockRes();
      await getServicesWithCounts({}, res);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(9);
      for (const svc of res.body) {
        expect(typeof svc.queueCount).toBe("number");
      }
      const general = res.body.find((s) => s.name === "General Consultation");
      // Seed: 4 pending entries on the General Consultation queue (positions 5–8).
      expect(general.queueCount).toBeGreaterThanOrEqual(4);
    });
  });

  describe("createService → updateService → deleteService", () => {
    it("creates, updates, then soft-deletes a service end-to-end", async () => {
      const createRes = mockRes();
      await createService(
        { body: { name: "Integration Test Service", description: "Created by test" } },
        createRes
      );
      expect(createRes.statusCode).toBe(201);
      const id = createRes.body.id;

      const updateRes = mockRes();
      await updateService(
        { params: { id: String(id) }, body: { name: "Renamed Service", description: "Updated by test" } },
        updateRes
      );
      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.name).toBe("Renamed Service");

      const deleteRes = mockRes();
      await deleteService({ params: { id: String(id) } }, deleteRes);
      expect(deleteRes.statusCode).toBe(200);

      const { rows } = await pool.query(
        "SELECT service_is_deleted FROM services WHERE service_id = $1",
        [id]
      );
      expect(rows[0].service_is_deleted).toBe(true);
    });

    it("returns 404 when updating a service that does not exist", async () => {
      const res = mockRes();
      await updateService(
        { params: { id: "99999" }, body: { name: "x", description: "x" } },
        res
      );
      expect(res.statusCode).toBe(404);
    });
  });
});
