import API from "./api";

export const getAllUsers = async () => {
  const response = await API.get("/admin/users");
  return response.data;
};