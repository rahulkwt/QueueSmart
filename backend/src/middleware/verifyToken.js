import pool from "../db.js";

/**
 * Express middleware that validates a Bearer token from the Authorization header.
 * Queries the database to find the matching user and attaches it to req.user.
 * Returns 401 if the header is missing, malformed, or the token doesn't match any user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export async function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Expect format: "Bearer <token>" — anything else is rejected
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_token = $1",
      [token]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user.user_id,
      name: user.user_full_name,
      email: user.user_email,
      role: user.user_role,
      token: user.user_token,
    };

    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Express middleware that checks the authenticated user has the "admin" role.
 * Must be used after verifyToken (depends on req.user being set).
 * Returns 403 if the user is not an admin.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function verifyAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: admin access required." });
  }
  next();
}
