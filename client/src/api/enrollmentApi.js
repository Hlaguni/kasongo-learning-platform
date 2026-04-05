import api from "./axios";

export const getAllEnrollments = async (params = {}) => {
  const response = await api.get("/enrollments", { params });
  return response.data;
};

export const getEnrollmentsByStudent = async (studentId) => {
  const response = await api.get(`/enrollments/student/${studentId}`);
  return response.data;
};

export const getMyEnrollments = async () => {
  const response = await api.get("/enrollments/my-enrollments");
  return response.data;
};

export const createEnrollment = async (payload) => {
  const response = await api.post("/enrollments", payload);
  return response.data;
};

export const updateEnrollment = async (enrollmentId, payload) => {
  const response = await api.put(`/enrollments/${enrollmentId}`, payload);
  return response.data;
};