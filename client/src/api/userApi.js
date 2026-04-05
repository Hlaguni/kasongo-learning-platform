import api from "./axios";

export const registerUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const getAllStudents = async (params = {}) => {
  const response = await api.get("/students", { params });
  return response.data;
};

export const getStudentById = async (studentId) => {
  const response = await api.get(`/students/${studentId}`);
  return response.data;
};

export const getStudentEnrollments = async (studentId) => {
  const response = await api.get(`/students/${studentId}/enrollments`);
  return response.data;
};