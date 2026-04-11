import pool from "../db.js";

/**
 * Returns all active services from the database.
 */
export async function getServices(req, res) {
  try {
    const result = await pool.query(
      "SELECT service_id, service_name, service_description FROM services WHERE service_is_deleted = false"
    );
    const services = result.rows.map((row) => ({
      id: row.service_id,
      name: row.service_name,
      description: row.service_description,
    }));
    return res.status(200).json(services);
  } catch (err) {
    console.error("getServices error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Returns all active services each enriched with its current queue count.
 */
export async function getServicesWithCounts(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.service_id, s.service_name, s.service_description,
              COUNT(e.entry_id) FILTER (WHERE e.queue_entry_status = 'pending') AS queue_count
       FROM services s
       LEFT JOIN queue_entry e ON e.service_id = s.service_id
       WHERE s.service_is_deleted = false
       GROUP BY s.service_id`
    );
    const services = result.rows.map((row) => ({
      id: row.service_id,
      name: row.service_name,
      description: row.service_description,
      queueCount: parseInt(row.queue_count),
    }));
    return res.status(200).json(services);
  } catch (err) {
    console.error("getServicesWithCounts error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function createService(req, res) {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO services (service_name, service_description, service_duration, service_is_deleted) VALUES ($1, $2, 0, false) RETURNING *",
      [name, description]
    );
    const row = result.rows[0];
    return res.status(201).json({ id: row.service_id, name: row.service_name, description: row.service_description });
  } catch (err) {
    console.error("createService error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function updateService(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const result = await pool.query(
      "UPDATE services SET service_name = $1, service_description = $2 WHERE service_id = $3 RETURNING *",
      [name, description, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Service not found." });
    const row = result.rows[0];
    return res.status(200).json({ id: row.service_id, name: row.service_name, description: row.service_description });
  } catch (err) {
    console.error("updateService error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE services SET service_is_deleted = true WHERE service_id = $1 RETURNING service_id",
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Service not found." });
    return res.status(200).json({ message: "Service deleted." });
  } catch (err) {
    console.error("deleteService error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
