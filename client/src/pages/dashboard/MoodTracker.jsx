import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addMood, getMoods } from '../../api/mood';

const moods = [
  { mood: 'Happy', emoji: '😊', color: 'bg-green-400' },
  { mood: 'Calm', emoji: '😌', color: 'bg-blue-400' },
  { mood: 'Sad', emoji: '😢', color: 'bg-indigo-400' },
  { mood: 'Anxious', emoji: '😟', color: 'bg-yellow-400' },
  { mood: 'Angry', emoji: '😠', color: 'bg-red-400' },
];

const MoodTracker = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [moodHistory, setMoodHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMoods = async () => {
      const { data, error } = await getMoods();
      if (data) {
        setMoodHistory(data.data);
      } else {
        setError('Could not fetch mood history.');
      }
    };
    fetchMoods();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood) {
      setError('Please select a mood.');
      return;
    }
    const moodData = {
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      note,
    };
    const { data, error } = await addMood(moodData);
    if (data) {
      setMoodHistory([data.data, ...moodHistory]);
      setSelectedMood(null);
      setNote('');
      setError('');
    } else {
      setError('Could not save mood. Please try again.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">How are you feeling today?</h2>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="mb-8 p-4 border rounded-lg bg-white shadow-sm">
        <div className="flex justify-around mb-4">
          {moods.map((mood) => (
            <button
              key={mood.mood}
              type="button"
              onClick={() => setSelectedMood(mood)}
              className={`p-4 rounded-full text-4xl transition-transform transform hover:scale-110 ${
                selectedMood?.mood === mood.mood ? 'ring-4 ring-offset-2 ring-blue-500' : ''
              }`}
            >
              {mood.emoji}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note (optional)..."
          className="w-full p-2 border rounded mb-4"
          rows="3"
        ></textarea>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
          Log Mood
        </button>
      </form>

      <h3 className="text-xl font-bold mb-4">Your Mood History (Last 30 days)</h3>
      <div className="space-y-4">
        {moodHistory.length > 0 ? (
          moodHistory.map((entry) => (
            <div key={entry._id} className="p-4 border rounded-lg bg-white shadow-sm flex items-center">
              <span className="text-4xl mr-4">{entry.emoji}</span>
              <div>
                <p className="font-semibold">{entry.mood}</p>
                <p className="text-gray-600">{entry.note}</p>
                <p className="text-sm text-gray-400">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No mood entries yet.</p>
        )}
      </div>
    </div>
  );
};

export default MoodTracker;
