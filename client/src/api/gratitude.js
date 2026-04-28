import api from './axios';

export const getEntries = async () => {
  try {
    const { data } = await api.get('/gratitude');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createEntry = async (data) => {
  try {
    const res = await api.post('/gratitude', data);
    return { data: res.data, error: null };
  } catch (error) {
    throw error;
  }
};

export const deleteEntry = async (id) => {
  try {
    await api.delete(`/gratitude/${id}`);
    return { error: null };
  } catch (error) {
    return { error };
  }
};
