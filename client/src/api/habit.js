import api from './axios';

export const getHabits = async () => {
  try {
    const { data } = await api.get('/habits');
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const createHabit = async (habitData) => {
  try {
    const { data } = await api.post('/habits', habitData);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateHabit = async (id, habitData) => {
    try {
      const { data } = await api.put(`/habits/${id}`, habitData);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

export const deleteHabit = async (id) => {
  try {
    await api.delete(`/habits/${id}`);
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const logHabit = async (id, date) => {
  try {
    const { data } = await api.post(`/habits/${id}/log`, { date });
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const getLogs = async (startDate, endDate) => {
  try {
    const { data } = await api.get(`/habits/logs?startDate=${startDate}&endDate=${endDate}`);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
