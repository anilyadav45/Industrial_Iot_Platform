import api from "./api";

export const getAlerts = async () => {
  const response = await api.get("/api/alerts");
  return response.data;
};

export const getActiveAlerts = async () => {
  const response = await api.get("/api/alerts/active");
  return response.data;
};

export const getAlert = async (alertId: number) => {
  const response = await api.get(`/api/alerts/${alertId}`);
  return response.data;
};

export const acknowledgeAlert = async (alertId: number) => {
  const response = await api.patch(
    `/api/alerts/${alertId}/acknowledge`
  );

  return response.data;
};

export const resolveAlert = async (alertId: number) => {
  const response = await api.patch(
    `/api/alerts/${alertId}/resolve`
  );

  return response.data;
};