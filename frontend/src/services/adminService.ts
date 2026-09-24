import api from "./api";

// Organizations

export const getOrganizations = async () => {
  const response = await api.get("/api/organizations");
  return response.data;
};

export const createOrganization = async (
  name: string,
  code: string
) => {
  const response = await api.post("/api/organizations", {
    name,
    code,
  });

  return response.data;
};

// Factories

export const getFactories = async () => {
  const response = await api.get("/api/factories");
  return response.data;
};

export const createFactory = async (
  name: string,
  location: string,
  organization_id: number
) => {
  const response = await api.post("/api/factories", {
    name,
    location,
    organization_id,
  });

  return response.data;
};

// Production Lines

export const getProductionLines = async () => {
  const response = await api.get(
    "/api/production-lines"
  );

  return response.data;
};

export const createProductionLine = async (
  name: string,
  factory_id: number
) => {
  const response = await api.post(
    "/api/production-lines",
    {
      name,
      factory_id,
    }
  );

  return response.data;
};

// Machines

export const getMachines = async () => {
  const response = await api.get("/api/machines");
  return response.data;
};

export const createMachine = async (data: {
  machine_code: string;
  name: string;
  machine_type: string;
  factory_id: number;
  production_line_id?: number;
}) => {
  const response = await api.post(
    "/api/machines",
    data
  );

  return response.data;
};

// Sensors

export const getSensors = async () => {
  const response = await api.get("/api/sensors");
  return response.data;
};

export const createSensor = async (data: {
  sensor_code: string;
  sensor_type: string;
  unit: string;
  machine_id: number;
}) => {
  const response = await api.post(
    "/api/sensors",
    data
  );

  return response.data;
};