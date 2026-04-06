import { randomUUID } from "crypto";
import pool from "../db.js";

/**
 * Registers a new user account.
 * Validates required fields, checks for duplicate email/username,
 * then inserts the new user with a default role of "user".
 * @param {import('express').Request} req - Body: { name, email, username, password }
 * @param {import('express').Response} res - 201 on success, 400 if fields missing, 409 on duplicate.
 */
export async function register(req, res) {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const duplicate = await pool.query(
      "SELECT user_id FROM users WHERE user_email = $1 OR user_username = $2 LIMIT 1",
      [email, username]
    );

    if (duplicate.rows.length > 0) {
      return res.status(409).json({ message: "Email or username already in use." });
    }

    await pool.query(
      `INSERT INTO users (user_email, user_username, user_password, user_full_name, user_role)
       VALUES ($1, $2, $3, $4, 'user')`,
      [email, username, password, name]
    );

    return res.status(201).json({ message: "Account created successfully." });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}

/**
 * Authenticates a user by email and password.
 * On success, generates a new session token, persists it, and returns the user's public data.
 * @param {import('express').Request} req - Body: { email, password }
 * @param {import('express').Response} res - 200 with user data on success, 401 on bad credentials.
 */
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    const user = result.rows[0];

    // Treat "user not found" the same as "wrong password" to avoid user enumeration
    if (!user || user.user_password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate a fresh token each login and persist it for later validation
    const token = randomUUID();
    await pool.query(
      "UPDATE users SET user_token = $1 WHERE user_id = $2",
      [token, user.user_id]
    );

    // Return only public-safe fields — never send the password back
    return res.status(200).json({
      id: user.user_id,
      name: user.user_full_name,
      email: user.user_email,
      role: user.user_role,
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
}
