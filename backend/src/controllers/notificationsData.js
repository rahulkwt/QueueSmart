import { notificationsData } from "../mock/notificationsData.js";

export const getNotifications = (req, res) => {
  res.json(notificationsData);
};