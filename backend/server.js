import express from "express";
import cors from "cors";
import historyRoutes from "./src/routes/historyRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

import serviceRoutes from "./src/routes/routes.js";


import servicesRoute from "./src/routes/servicesRoute.js";
import queueRoutes from "./src/routes/queueRoutes.js";
import userQueueRoutes from "./src/routes/userQueueRoutes.js";
const app = express();

app.use(cors());   // allow cross-origin requests
app.use(express.json()); // parse incoming JSON request bodies (required for req.body to work)

app.use("/api/user", historyRoutes);
app.use("/api/auth", authRoutes); // mount auth routes: /api/auth/register, /api/auth/login
app.use("/api", waitTimeRoutes);  // mount wait-time routes: /api/queue/wait-time
app.use("/api", userQueueRoutes); // mount user-facing queue routes: /api/queue/...

app.use("/api/admin", servicesRoute);
app.use("/api/admin", queueRoutes);
// run another terminal process
// cd into ./backend
// run "node server.js"
// data is now able to be fetched
const PORT = 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});