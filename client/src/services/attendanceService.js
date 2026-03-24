import API from "./api";

export const getAttendance = async () => {
  const response = await API.get("/attendance");
  return response.data;
};

export const markAttendance = async (attendanceData) => {
  const response = await API.post("/attendance", attendanceData);
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await API.get("/attendance/my-attendance");
  return response.data;
};