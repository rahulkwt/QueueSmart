import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(__dirname, "../data/users.json");

/**
 * Express middleware that validates a Bearer token from the Authorization header.
 * Attaches the matching user object to req.user so downstream handlers can use it.
 * Returns 401 if the header is missing, malformed, or the token doesn't match any user.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Expect format: "Bearer <token>" — anything else is rejected
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Look up the token in users.json — tokens are regenerated on each login
  const users = JSON.parse(readFileSync(USERS_FILE, "utf-8"));
  const user = users.find((u) => u.token === token);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach the user so controllers can access req.user without re-reading the file
  req.user = user;
  next();
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
