import axios from "./axios";

export const getCourses = (params) => axios.get("/courses", { params });

export const getCourse = (id) => axios.get(`/courses/${id}`);

export const getEnrollmentStatus = (id) => axios.get(`/courses/${id}/enrollment`);

export const enrollCourse = (id) => axios.post(`/courses/${id}/enroll`);

export const getMyEnrollments = () => axios.get("/courses/my/enrollments");

export const completeLesson = (courseId, lessonId) => axios.post(`/courses/${courseId}/lessons/${lessonId}/complete`);
