import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: "5432",
  database: "queue_smart_db",
  user: "postgres",
  password: "admin123",
});

pool.on("error", (err) => {
  console.error("Unexpected database pool error:", err);
});

export default pool;
