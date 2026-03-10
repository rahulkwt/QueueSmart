// FOURTH

import express from "express";
import cors from "cors";
import historyRoutes from "./src/routes/historyRoutes.js";

const app = express();

app.use(cors());   // allow cross-origin requests

app.use("/api", historyRoutes);

// run another terminal process
// cd into ./backend
// run "node server.js"
// data is now able to be fetched
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});