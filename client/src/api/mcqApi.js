import axios from "./axios";

export const getAllMCQs = async () => {
  const response = await axios.get("/mcqs");
  return response.data;
};

export const getMCQByLesson = async (lessonId) => {
  const response = await axios.get(`/mcqs/lesson/${lessonId}`);
  return response.data;
};

export const createMCQ = async (mcqData) => {
  const response = await axios.post("/mcqs", mcqData);
  return response.data;
};

export const updateMCQ = async (mcqId, mcqData) => {
  const response = await axios.put(`/mcqs/${mcqId}`, mcqData);
  return response.data;
};

export const deleteMCQ = async (mcqId) => {
  const response = await axios.delete(`/mcqs/${mcqId}`);
  return response.data;
};

export const toggleMCQPublish = async (mcq) => {
  const response = await axios.put(`/mcqs/${mcq._id}`, {
    isPublished: !mcq.isPublished,
  });
  return response.data;
};

export const toggleMCQActive = async (mcq) => {
  const response = await axios.put(`/mcqs/${mcq._id}`, {
    isActive: !mcq.isActive,
  });
  return response.data;
};

export const getStudentMCQByLesson = async (lessonId) => {
  const response = await axios.get(`/mcqs/student/lesson/${lessonId}`);
  return response.data;
};

export const submitStudentMCQ = async (lessonId, answers) => {
  const response = await axios.post(`/mcqs/student/submit/${lessonId}`, {
    answers,
  });
  return response.data;
};