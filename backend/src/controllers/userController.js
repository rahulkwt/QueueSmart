import { userData } from "../mock/userData.js";

export const getUser = (req, res) => {
  res.json(userData);
};