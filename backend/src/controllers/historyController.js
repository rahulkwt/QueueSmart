// SECOND, get as JSON

import { historyData } from "../mock/historyData.js";

export const getHistory = (req, res) => {
  res.json(historyData);
};