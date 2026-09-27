import api from "./api";

export const analyzeResource = async (resourceId: number) => {
  const response = await api.post(
    `/api/optimization/resources/${resourceId}/analyze`
  );

  return response.data;
};

export const getRecommendations = async () => {
  const response = await api.get(
    "/api/optimization/recommendations"
  );

  return response.data;
};

export const getResourceRecommendations = async (
  resourceId: number
) => {
  const response = await api.get(
    `/api/optimization/resources/${resourceId}/recommendations`
  );

  return response.data;
};

export const acknowledgeRecommendation = async (
  recommendationId: number
) => {
  const response = await api.patch(
    `/api/optimization/recommendations/${recommendationId}/acknowledge`
  );

  return response.data;
};

export const resolveRecommendation = async (
  recommendationId: number
) => {
  const response = await api.patch(
    `/api/optimization/recommendations/${recommendationId}/resolve`
  );

  return response.data;
};