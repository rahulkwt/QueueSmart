import { serviceData } from "../mock/serviceData.js";
import { historyData, idState } from "../mock/historyData.js";

export const getService = (req, res) => {
    const { service } = req.query;
    const activeServices = serviceData.filter((item) => {
        if (item.isActive === false) return false;
        if (item.status === "Completed") return false;
        if (service) return item.service === service;
        return true;
    });
    res.json(activeServices);
};

export const addService = (req, res) => {
  const newService = {
    id: serviceData.length + 1,
    ...req.body,
    userId: req.user.id,
    isActive: true,
    leftReason: null,
    leftBy: null
  };

  serviceData.push(newService);
  res.status(201).json(newService);
};

export const leaveService = (req, res) => {
  const { id } = req.params;
  const { leftReason, leftBy, status } = req.body;

  const service = serviceData.find((item) => item.id === Number(id));

  if (!service) {
    return res.status(404).json({ message: "Queue entry not found" });
  }

  service.isActive = false;
  service.status = status || "Aborted";
  service.leftReason = leftReason || "User left queue";
  service.leftBy = leftBy || "user";

  if (service.status === "Completed" && service.userId) {
    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    historyData.push({
      id: idState.nextId++,
      userId: service.userId,
      service: service.service,
      doctor: "",
      date: `${mm}-${dd}-${yyyy}`,
      notes: "",
      status: "Completed",
    });
  }

  res.json(service);
};