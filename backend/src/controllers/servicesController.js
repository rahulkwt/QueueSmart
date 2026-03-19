// SECOND, get as JSON

import { serviceData } from "../mock/servicesData.js";

export const getServices = (req, res) => {
  res.json(serviceData );
};