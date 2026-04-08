import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import pg from "pg";

// Resolve .env from the project root (two levels up from backend/src/)
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../../.env") });

const { Pool } = pg;

/**
 * PostgreSQL connection pool configured from environment variables.
 * Values are loaded from the .env file at the project root via dotenv.
 */
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10), // pg expects a number, not a string
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export default pool;
