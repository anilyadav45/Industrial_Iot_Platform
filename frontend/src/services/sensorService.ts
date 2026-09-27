import api from "./api";

export const getSensorReadings = async (
  sensorId: number,
  limit = 100
) => {
  const response = await api.get(
    `/api/readings/sensor/${sensorId}`,
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
};