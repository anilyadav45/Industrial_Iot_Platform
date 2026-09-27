import api from "./api";

export const getCloudResources = async () => {
  const response = await api.get("/api/cloud-resources");
  return response.data;
};

export const createCloudResource = async (data: {
  name: string;
  resource_type: string;
  provider: string;
  region: string;
  cpu_cores: number;
  memory_gb: number;
  storage_gb: number;
  network_mbps: number;
}) => {
  const response = await api.post("/api/cloud-resources", data);
  return response.data;
};

export const updateCloudResource = async (
  resourceId: number,
  data: Record<string, unknown>
) => {
  const response = await api.patch(
    `/api/cloud-resources/${resourceId}`,
    data
  );

  return response.data;
};

export const deleteCloudResource = async (resourceId: number) => {
  const response = await api.delete(
    `/api/cloud-resources/${resourceId}`
  );

  return response.data;
};