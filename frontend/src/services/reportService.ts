import api from "./api";

export const getMachineReport = async (machineId: number) => {
  const response = await api.get(
    `/api/reports/machines/${machineId}`
  );

  return response.data;
};

export const getAlertReport = async () => {
  const response = await api.get(
    "/api/reports/alerts"
  );

  return response.data;
};

export const getOptimizationReport = async () => {
  const response = await api.get(
    "/api/reports/optimization"
  );

  return response.data;
};