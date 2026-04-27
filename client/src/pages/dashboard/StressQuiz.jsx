import React, { useState, useEffect } from 'react';
import { getQuestions, submitQuiz, getHistory } from '../../api/stressQuiz';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const answerOptions = [
  { text: 'Never', value: 0 },
  { text: 'Almost Never', value: 1 },
  { text: 'Sometimes', value: 2 },
  { text: 'Fairly Often', value: 3 },
  { text: 'Very Often', value: 4 },
];

const StressQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [view, setView] = useState('new'); // 'new', 'result', 'history'
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await getQuestions();
      if (data) {
        setQuestions(data.data);
      } else {
        setError('Could not load quiz questions.');
      }
    };
    fetchQuestions();
  }, []);

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    const { data, error } = await submitQuiz(answers);
    if (data) {
      setResult(data.data);
      setView('result');
    } else {
      setError('Could not submit your quiz. Please try again.');
    }
  };

  const fetchHistory = async () => {
    const { data, error } = await getHistory();
    if (data) {
      setHistory(data.data);
      setView('history');
    } else {
      setError('Could not fetch quiz history.');
    }
  };

  const startNewQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setView('new');
    setError('');
  };

  const renderQuiz = () => {
    if (questions.length === 0) return <p>Loading quiz...</p>;
    const question = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <h3 className="text-lg font-semibold mb-4">
          ({currentQuestionIndex + 1}/{questions.length}) {question.text}
        </h3>
        <div className="flex flex-col space-y-2">
          {answerOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleAnswer(question.id, option.value)}
              className={`w-full text-left p-3 border rounded-lg hover:bg-gray-100 ${
                answers[question.id] === option.value ? 'bg-blue-100 border-blue-500' : ''
              }`}
            >
              {option.text}
            </button>
          ))}
        </div>
        {currentQuestionIndex === questions.length - 1 && (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length !== questions.length}
            className="mt-6 w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Submit Quiz
          </button>
        )}
      </div>
    );
  };

  const renderResult = () => (
    <div className="p-4 border rounded-lg bg-white shadow-sm text-center">
      <h3 className="text-2xl font-bold mb-2">Your Result</h3>
      <p className="text-lg mb-1">
        Stress Level: <span className="font-semibold">{result.level}</span>
      </p>
      <p className="text-lg mb-4">
        Score: <span className="font-semibold">{result.score}</span> (out of 40)
      </p>
      <div className="text-left mb-6">
        <h4 className="font-bold text-md mb-2">Recommendations:</h4>
        <ul className="list-disc list-inside space-y-1">
          {result.recommendations.map((rec, index) => (
            <li key={index}>{rec}</li>
          ))}
        </ul>
      </div>
      <button onClick={startNewQuiz} className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
        Take Quiz Again
      </button>
    </div>
  );

  const renderHistory = () => {
    const chartData = history.map(h => ({
        name: new Date(h.timestamp).toLocaleDateString(),
        score: h.score
    })).reverse();

    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <h3 className="text-2xl font-bold mb-4">Quiz History</h3>
        {history.length > 0 ? (
            <>
            <div className="h-64 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 40]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-4">
            {history.map((item) => (
              <div key={item._id} className="p-3 border rounded-lg">
                <p>
                  <strong>Date:</strong> {new Date(item.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Score:</strong> {item.score} - <strong>Level:</strong> {item.level}
                </p>
              </div>
            ))}
          </div>
          </>
        ) : (
          <p>No quiz history found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Perceived Stress Scale Quiz</h2>
        <div>
          <button onClick={startNewQuiz} className="mr-2 px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            New Quiz
          </button>
          <button onClick={fetchHistory} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            View History
          </button>
        </div>
      </div>
      {error && <p className="text-red-500 bg-red-100 p-2 mb-4 rounded">{error}</p>}
      {view === 'new' && renderQuiz()}
      {view === 'result' && renderResult()}
      {view === 'history' && renderHistory()}
    </div>
  );
};

export default StressQuiz;
