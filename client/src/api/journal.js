import api from './axios';

export const getEntries = async () => {
  try {
    const { data } = await api.get('/journal');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createEntry = async (entryData) => {
  try {
    const { data } = await api.post('/journal', entryData);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateEntry = async (id, entryData) => {
  try {
    const { data } = await api.put(`/journal/${id}`, entryData);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteEntry = async (id) => {
  try {
    await api.delete(`/journal/${id}`);
    return { error: null };
  } catch (error) {
    return { error };
  }
};
