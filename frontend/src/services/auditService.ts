import api from "./api";

export const getAuditLogs = async () => {
  const response = await api.get("/api/audit-logs");

  return response.data;
};