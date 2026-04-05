import axios from "./axios";

export const getAllGrades = async () => {
  const response = await axios.get("/grades");
  return response.data;
};

export const getGradeById = async (gradeId) => {
  const response = await axios.get(`/grades/${gradeId}`);
  return response.data;
};

export const createGrade = async (gradeData) => {
  const response = await axios.post("/grades", gradeData);
  return response.data;
};

export const updateGrade = async (gradeId, gradeData) => {
  const response = await axios.put(`/grades/${gradeId}`, gradeData);
  return response.data;
};

export const deleteGrade = async (gradeId) => {
  const response = await axios.delete(`/grades/${gradeId}`);
  return response.data;
};