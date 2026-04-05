import axios from "./axios";

export const getMyResults = async () => {
  const response = await axios.get("/results/my-results");
  return response.data;
};

export const getAllResults = async () => {
  const response = await axios.get("/results");
  return response.data;
};

export const getResultsByStudent = async (studentId) => {
  const response = await axios.get(`/results/student/${studentId}`);
  return response.data;
};