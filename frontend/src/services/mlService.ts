import api from "./api";

export const getMachineHealth = async (machineId: number) => {
  const response = await api.get(
    `/api/ml/machines/${machineId}/health`
  );

  return response.data;
};

export const getMachinePredictions = async (machineId: number) => {
  const response = await api.get(
    `/api/ml/machines/${machineId}/predictions`
  );

  return response.data;
};

export const getAllPredictions = async () => {
  const response = await api.get("/api/ml/predictions");

  return response.data;
};

export const analyzeMachine = async (machineId: number) => {
  const response = await api.post(
    `/api/ml/machines/${machineId}/analyze`
  );

  return response.data;
};