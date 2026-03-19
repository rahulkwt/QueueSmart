// FOURTH

import express from "express";
import cors from "cors";
import historyRoutes from "./src/routes/historyRoutes.js";
import servicesRoute from "./src/routes/servicesRoute.js";
const app = express();

app.use(cors());   // allow cross-origin requests

app.use("/api", historyRoutes);
app.use("/api", servicesRoute);
// run another terminal process
// cd into ./backend
// run "node server.js"
// data is now able to be fetched
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});