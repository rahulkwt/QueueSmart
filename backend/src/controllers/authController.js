import { readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const USERS_FILE = join(__dirname, "../data/users.json");

/**
 * Reads and parses the users JSON file from disk.
 * @returns {Array} Array of user objects.
 */
function readUsers() {
  return JSON.parse(readFileSync(USERS_FILE, "utf-8"));
}

/**
 * Serializes and writes the users array back to disk.
 * @param {Array} users - The updated array of user objects to persist.
 */
function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Registers a new user account.
 * Validates required fields, checks for duplicate email/username,
 * then persists the new user with a default role of "user".
 * @param {import('express').Request} req - Body: { name, email, username, password }
 * @param {import('express').Response} res - 201 on success, 400 if fields missing, 409 on duplicate.
 */
export function register(req, res) {
  const { name, email, username, password } = req.body;

  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const users = readUsers();

  // Reject if email or username is already taken
  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ message: "Email already in use." });
  }
  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: "Username already taken." });
  }

  // Build the new user — all new accounts start as "user" role
  const newUser = {
    id: randomUUID(),
    name,
    email,
    username,
    password,
    role: "user",
    token: null,
  };

  users.push(newUser);
  writeUsers(users); // persist to file

  return res.status(201).json({ message: "Account created successfully." });
}

/**
 * Authenticates a user by email and password.
 * On success, generates a new session token, persists it, and returns the user's public data.
 * @param {import('express').Request} req - Body: { email, password }
 * @param {import('express').Response} res - 200 with user data on success, 401 on bad credentials.
 */
export function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const user = users.find((u) => u.email === email);

  // Treat "user not found" the same as "wrong password" to avoid user enumeration
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  // Generate a fresh token each login and save it so it can be validated later
  user.token = randomUUID();
  writeUsers(users);

  // Return only public-safe fields — never send the password back
  return res.status(200).json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: user.token,
  });
}