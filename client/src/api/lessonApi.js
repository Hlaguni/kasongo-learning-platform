import axios from "./axios";

export const getAllLessons = async () => {
  const response = await axios.get("/lessons");
  return response.data;
};

export const getLessonById = async (lessonId) => {
  const response = await axios.get(`/lessons/${lessonId}`);
  return response.data;
};

export const getMyLessons = async () => {
  const response = await axios.get("/lessons/my-lessons");
  return response.data;
};

export const getLessonsByTopic = async (topicId) => {
  const response = await axios.get(`/lessons/topic/${topicId}`);
  return response.data;
};

export const createLesson = async (lessonData) => {
  const response = await axios.post("/lessons", lessonData);
  return response.data;
};

export const updateLesson = async (lessonId, lessonData) => {
  const response = await axios.put(`/lessons/${lessonId}`, lessonData);
  return response.data;
};

export const deleteLesson = async (lessonId) => {
  const response = await axios.delete(`/lessons/${lessonId}`);
  return response.data;
};

export const toggleLessonPublish = async (lesson) => {
  const response = await axios.put(`/lessons/${lesson._id}`, {
    isPublished: !lesson.isPublished,
  });
  return response.data;
};

export const toggleLessonActive = async (lesson) => {
  const response = await axios.put(`/lessons/${lesson._id}`, {
    isActive: !lesson.isActive,
  });
  return response.data;
};