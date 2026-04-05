import api from "./axios";

export const getAllSubjects = async () => {
  const response = await api.get("/subjects");
  return response.data;
};

export const getSubjectById = async (subjectId) => {
  const response = await api.get(`/subjects/${subjectId}`);
  return response.data;
};

export const createSubject = async (subjectData) => {
  const response = await api.post("/subjects", subjectData);
  return response.data;
};

export const updateSubject = async (subjectId, subjectData) => {
  const response = await api.put(`/subjects/${subjectId}`, subjectData);
  return response.data;
};

export const deleteSubject = async (subjectId) => {
  const response = await api.delete(`/subjects/${subjectId}`);
  return response.data;
};