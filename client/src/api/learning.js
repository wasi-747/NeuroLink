import api from "./axios";

export const buildKnowledgeGraph = () => {
  return api.post("/learning/build");
};

export const getLearningPath = () => {
  return api.get("/learning/path");
};
