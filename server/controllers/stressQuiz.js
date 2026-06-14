import StressQuizResult from '../models/StressQuizResult.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

const questions = [
  { id: 1, text: "Been upset because of something that happened unexpectedly?", weight: 1 },
  { id: 2, text: "Felt that you were unable to control the important things in your life?", weight: 1 },
  { id: 3, text: "Felt nervous and stressed?", weight: 1 },
  { id: 4, text: "Felt confident about your ability to handle your personal problems?", weight: -1 }, // Inverted
  { id: 5, text: "Felt that things were going your way?", weight: -1 }, // Inverted
  { id: 6, text: "Found that you could not cope with all the things that you had to do?", weight: 1 },
  { id: 7, text: "Been able to control irritations in your life?", weight: -1 }, // Inverted
  { id: 8, text: "Felt that you were on top of things?", weight: -1 }, // Inverted
  { id: 9, text: "Been angered because of things that were outside of your control?", weight: 1 },
  { id: 10, text: "Felt difficulties were piling up so high that you could not overcome them?", weight: 1 }
];

const calculateScore = (answers) => {
    let score = 0;
    questions.forEach(q => {
        const answerValue = answers[q.id]; // expecting answers as { "1": 0, "2": 1, ... }
        if (answerValue !== undefined) {
            if (q.weight === 1) {
                score += answerValue;
            } else { // weight === -1 (inverted question)
                score += (4 - answerValue);
            }
        }
    });
    return score;
};

const getStressLevelAndRecommendations = (score) => {
    if (score <= 13) {
        return {
            level: 'Low',
            recommendations: [
                'Maintain your healthy habits and coping strategies.',
                'Continue practicing mindfulness and relaxation techniques.',
                'Engage in regular physical activity.'
            ]
        };
    } else if (score <= 26) {
        return {
            level: 'Moderate',
            recommendations: [
                'Identify your main stressors and look for solutions.',
                'Practice daily relaxation exercises like deep breathing or meditation.',
                'Ensure you are getting enough sleep and eating a balanced diet.'
            ]
        };
    } else { // score >= 27
        return {
            level: 'High',
            recommendations: [
                'Consider talking to a mental health professional.',
                'Prioritize self-care and set boundaries to reduce commitments.',
                'Develop a strong support system of friends and family to talk to.',
                'Avoid unhealthy coping mechanisms like alcohol or excessive caffeine.'
            ]
        };
    }
}


// @desc    Submit a stress quiz
// @route   POST /api/v1/stress-quiz
// @access  Private
export const submitQuiz = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const { answers } = req.body;

  if (!answers || Object.keys(answers).length !== questions.length) {
      return next(new ErrorResponse('Please answer all questions', 400));
  }

  const score = calculateScore(answers);
  const { level, recommendations } = getStressLevelAndRecommendations(score);

  const quizResult = await StressQuizResult.create({
    user: req.user.id,
    score,
    severity: level,
    recommendations,
    answers
  });

  res.status(201).json({
    success: true,
    data: quizResult,
  });
});

// @desc    Get quiz history
// @route   GET /api/v1/stress-quiz
// @access  Private
export const getQuizHistory = asyncHandler(async (req, res, next) => {
  const history = await StressQuizResult.find({ user: req.user.id }).sort({ completedAt: -1 });
  
  res.status(200).json({
    success: true,
    count: history.length,
    data: history,
  });
});

// @desc    Get quiz questions
// @route   GET /api/v1/stress-quiz/questions
// @access  Public
export const getQuizQuestions = (req, res, next) => {
    res.status(200).json({
        success: true,
        count: questions.length,
        data: questions.map(({id, text}) => ({id, text})) // Don't send weights to client
    });
};
