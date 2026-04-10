import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Resolve .env from the project root regardless of where `node` is invoked from
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import historyRoutes from "./src/routes/historyRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import servicesRoute from "./src/routes/servicesRoute.js";
import queueRoutes from "./src/routes/queueRoutes.js";
import userQueueRoutes from "./src/routes/userQueueRoutes.js";
import waitTimeRoutes from "./src/routes/waitTimeRoutes.js";

const app = express();

app.use(cors());   // allow cross-origin requests
app.use(express.json()); // parse incoming JSON request bodies (required for req.body to work)

app.use("/api/user", historyRoutes);
app.use("/api/auth", authRoutes); // mount auth routes: /api/auth/register, /api/auth/login
app.use("/api", userQueueRoutes); // mount user-facing queue routes: /api/queue/...
app.use("/api", waitTimeRoutes); // mount wait-time estimation: /api/queue/:serviceId/wait-time

app.use("/api/admin", servicesRoute);
app.use("/api/admin", queueRoutes);

const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});