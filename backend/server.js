import express from "express";
import cors from "cors";
import historyRoutes from "./src/routes/historyRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

app.use(cors());   // allow cross-origin requests
app.use(express.json()); // parse incoming JSON request bodies (required for req.body to work)

app.use("/api", historyRoutes);
app.use("/api/auth", authRoutes); // mount auth routes: /api/auth/register, /api/auth/login

// run another terminal process
// cd into ./backend
// run "node server.js"
// data is now able to be fetched
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});