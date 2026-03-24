import API from "./api";

export const getStudentLessons = async () => {
  const response = await API.get("/lesson");
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await API.get("/attendance/my-attendance");
  return response.data;
};