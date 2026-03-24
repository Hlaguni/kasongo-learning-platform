import API from "./api";

export const loginUser = async (email, password) => {
  const response = await API.post("/auth/login", { email, password });
  return response.data;
};

export const getCurrentUser = async (token) => {
  const response = await API.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};