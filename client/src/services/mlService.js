const ML_BASE = 'http://localhost:8000/api/ml';

export const mlService = {
  async predictMood(formData) {
    const res = await fetch(`${ML_BASE}/predict-mood`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gender:          formData.gender,
        age:             parseInt(formData.age),
        year_of_study:   parseInt(formData.yearOfStudy),
        cgpa:            parseFloat(formData.cgpa),
        marital_status:  formData.maritalStatus,
        has_depression:  formData.hasDepression,
        has_anxiety:     formData.hasAnxiety,
        has_panic:       formData.hasPanic
      })
    });
    return res.json();
  },

  async analyzeSentiment(text) {
    const res = await fetch(`${ML_BASE}/analyze-sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return res.json();
  },

  async getSleepInsights(data) {
    const res = await fetch(`${ML_BASE}/sleep-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sleep_hours:   parseFloat(data.sleepHours),
        stress_level:  parseInt(data.stressLevel),
        sleep_quality: parseInt(data.sleepQuality)
      })
    });
    return res.json();
  },

  async searchFAQ(query) {
    const res = await fetch(
      `${ML_BASE}/faq-search?q=${encodeURIComponent(query)}`
    );
    return res.json();
  }
};
