import api from './axios';

export const getQuestions = async () => {
  try {
    const { data } = await api.get('/stress-quiz/questions');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const submitQuiz = async (answers) => {
  try {
    const { data } = await api.post('/stress-quiz', { answers });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getHistory = async () => {
  try {
    const { data } = await api.get('/stress-quiz');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
