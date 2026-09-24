import api from "./api";

export const getAnalyticsOverview = async () => {
  const response = await api.get("/api/analytics/overview");
  return response.data;
};

export const getSensorStatistics = async () => {
  const response = await api.get("/api/analytics/sensors");
  return response.data;
};

export const getRecentReadings = async (limit = 20) => {
  const response = await api.get(
    `/api/analytics/recent-readings?limit=${limit}`
  );

  return response.data;
};