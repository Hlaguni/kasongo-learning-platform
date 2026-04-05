import api from "./axios";

export const getAllTopics = async () => {
  const response = await api.get("/topics");
  return response.data;
};

export const getTopicById = async (topicId) => {
  const response = await api.get(`/topics/${topicId}`);
  return response.data;
};

export const createTopic = async (topicData) => {
  const response = await api.post("/topics", topicData);
  return response.data;
};

export const updateTopic = async (topicId, topicData) => {
  const response = await api.put(`/topics/${topicId}`, topicData);
  return response.data;
};

export const deleteTopic = async (topicId) => {
  const response = await api.delete(`/topics/${topicId}`);
  return response.data;
};