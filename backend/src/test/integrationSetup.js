import pg from "pg";
import { readFileSync, readdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const { Client } = pg;

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../../..");

config({ path: join(repoRoot, ".env") });

const TEST_DB = "queue_smart_test_db";

const adminConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "postgres",
};

export async function setup() {
  const admin = new Client(adminConfig);
  await admin.connect();

  // Kick any lingering connections so DROP succeeds even if a previous run left sockets open.
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity
       WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [TEST_DB]
  );
  await admin.query(`DROP DATABASE IF EXISTS ${TEST_DB}`);
  await admin.query(`CREATE DATABASE ${TEST_DB}`);
  await admin.end();

  const test = new Client({ ...adminConfig, database: TEST_DB });
  await test.connect();

  const migrationsDir = join(repoRoot, "database/migrations");
  const migrationFiles = readdirSync(migrationsDir)
    .filter((f) => /^\d{4}_.+\.sql$/.test(f))
    .sort();
  for (const file of migrationFiles) {
    await test.query(readFileSync(join(migrationsDir, file), "utf8"));
  }

  const seedSql = readFileSync(join(repoRoot, "database/seeds/seed.sql"), "utf8");
  await test.query(seedSql);

  await test.end();
}
