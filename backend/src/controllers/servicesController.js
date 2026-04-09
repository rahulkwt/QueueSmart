import pool from "../db.js";

/**
 * Returns all active (non-deleted) services.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with services array.
 */
export async function getServices(req, res) {
  try {
    const result = await pool.query(
      `SELECT service_id AS id, service_name AS name, service_description AS description
       FROM services
       WHERE service_is_deleted = FALSE
       ORDER BY service_id`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Returns all active services, each enriched with its current active queue count.
 * @param {import('express').Request} req
 * @param {import('express').Response} res - 200 with array of { id, name, description, queueCount }.
 */
export async function getServicesWithCounts(req, res) {
  try {
    const result = await pool.query(
      `SELECT s.service_id AS id,
              s.service_name AS name,
              s.service_description AS description,
              COUNT(q.queue_id)::int AS "queueCount"
       FROM services s
       LEFT JOIN queue q ON q.service_id = s.service_id AND q.is_deleted = FALSE
       WHERE s.service_is_deleted = FALSE
       GROUP BY s.service_id
       ORDER BY s.service_id`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Creates a new service.
 * @param {import('express').Request} req - Body: { name, description, duration? }
 * @param {import('express').Response} res - 201 with created service, 400 if fields missing, 409 if name taken.
 */
export async function createService(req, res) {
  const { name, description, duration = 0 } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const result = await pool.query(
      `INSERT INTO services (service_name, service_description, service_duration)
       VALUES ($1, $2, $3)
       RETURNING service_id AS id, service_name AS name, service_description AS description`,
      [name, description, duration]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "A service with that name already exists." });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Updates an existing service by ID.
 * @param {import('express').Request} req - Params: { id }. Body: { name, description }
 * @param {import('express').Response} res - 200 with updated service, 400 if fields missing, 404 if not found, 409 if name taken.
 */
export async function updateService(req, res) {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const result = await pool.query(
      `UPDATE services
       SET service_name = $1, service_description = $2
       WHERE service_id = $3 AND service_is_deleted = FALSE
       RETURNING service_id AS id, service_name AS name, service_description AS description`,
      [name, description, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found." });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "A service with that name already exists." });
    }
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Soft-deletes a service by ID (sets service_is_deleted = TRUE).
 * @param {import('express').Request} req - Params: { id }
 * @param {import('express').Response} res - 200 on success, 404 if not found.
 */
export async function deleteService(req, res) {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE services
       SET service_is_deleted = TRUE
       WHERE service_id = $1 AND service_is_deleted = FALSE`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Service not found." });
    }

    return res.status(200).json({ message: "Service deleted." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
