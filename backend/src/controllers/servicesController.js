import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVICES_FILE = join(__dirname, "../data/services.json");

/**
 * Reads and parses the services JSON file from disk.
 * @returns {Array} Array of service objects.
 */
function readServices() {
  return JSON.parse(readFileSync(SERVICES_FILE, "utf-8"));
}

/**
 * Serializes and writes the services array back to disk.
 * @param {Array} services - The updated array of service objects to persist.
 */
function writeServices(services) {
  writeFileSync(SERVICES_FILE, JSON.stringify(services, null, 2));
}

/**
 * Returns all configured services.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with services array.
 */
export function getServices(req, res) {
  return res.status(200).json(readServices());
}

/**
 * Creates a new service.
 * Validates required fields then persists the new service with a generated UUID.
 * @param {import('express').Request} req - Body: { name, description, duration }
 * @param {import('express').Response} res - 201 with the created service on success, 400 if fields missing.
 */
export function createService(req, res) {
  const { name, description, duration } = req.body;

  if (!name || !description || !duration) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const services = readServices();
  const newService = { id: randomUUID(), name, description, duration };
  services.push(newService);
  writeServices(services);

  return res.status(201).json(newService);
}

/**
 * Updates an existing service by ID.
 * @param {import('express').Request} req - Params: { id }. Body: { name, description, duration }
 * @param {import('express').Response} res - 200 with updated service, 400 if fields missing, 404 if not found.
 */
export function updateService(req, res) {
  const { id } = req.params;
  const { name, description, duration } = req.body;

  if (!name || !description || !duration) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const services = readServices();
  const index = services.findIndex((s) => s.id === id);

  if (index === -1) {
    return res.status(404).json({ message: "Service not found." });
  }

  services[index] = { id, name, description, duration };
  writeServices(services);

  return res.status(200).json(services[index]);
}
