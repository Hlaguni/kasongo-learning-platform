import API from "./api";

export const getLessons = async () => {
  const response = await API.get("/lesson");
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await API.post("/lesson", lessonData);
  return response.data;
};

export const getTopics = async () => {
  const response = await API.get("/topics");
  return response.data;
};