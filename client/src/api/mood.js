import api from './axios';

export const createMood = async (moodData) => {
  try {
    const { data } = await api.post('/mood', moodData);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getMoods = async (range = '30d') => {
  try {
    const { data } = await api.get(`/mood?range=${range}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
