import JournalEntry from "../models/JournalEntry.js";
import asyncHandler from "../middleware/async.js";
import ErrorResponse from "../utils/errorResponse.js";
import axios from "axios";

// @desc    Create a journal entry
// @route   POST /api/v1/journal
// @access  Private
export const addJournalEntry = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  const { title, content } = req.body;

  if (!title || !content) {
    return next(new ErrorResponse("Please provide a title and content", 400));
  }

  const journalEntry = await JournalEntry.create({
    user: req.user.id,
    title,
    content,
  });

  // Asynchronously call ML service for sentiment analysis
  if (process.env.ML_SERVICE_URL) {
    axios
      .post(`${process.env.ML_SERVICE_URL}/analyze/sentiment`, {
        text: content,
        source: "journal",
      })
      .then((response) => {
        const { sentiment, emotions, confidence, crisis_detected } =
          response.data;
        journalEntry.sentimentLabel = sentiment;
        journalEntry.sentimentScore = confidence;
        journalEntry.emotions = emotions;
        // Note: We save this in the background and don't wait for it.
        // The crisis modal on the frontend will be triggered by the response from this endpoint.
        journalEntry.save();
      })
      .catch((error) => {
        console.error(
          "Error calling ML service for sentiment analysis:",
          error.message,
        );
        // Don't block the user response, just log the error.
      });
  }

  // We need to send the sentiment back to the client immediately for the crisis modal
  let sentimentResponse = { crisis_detected: false };
  try {
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze/sentiment`,
      {
        text: content,
        source: "journal",
      },
    );
    sentimentResponse = mlResponse.data;
  } catch (error) {
    console.error(
      "Error calling ML service for immediate sentiment response:",
      error.message,
    );
  }

  res.status(201).json({
    success: true,
    data: journalEntry,
    sentiment: sentimentResponse,
  });
});

// @desc    Get all journal entries
// @route   GET /api/v1/journal
// @access  Private
export const getJournalEntries = asyncHandler(async (req, res, next) => {
  const entries = await JournalEntry.find({ user: req.user.id }).sort({
    createdAt: -1,
  });
  res.status(200).json({
    success: true,
    count: entries.length,
    data: entries,
  });
});

// @desc    Get a single journal entry
// @route   GET /api/v1/journal/:id
// @access  Private
export const getJournalEntry = asyncHandler(async (req, res, next) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(
      new ErrorResponse(
        `Journal entry not found with id of ${req.params.id}`,
        404,
      ),
    );
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to access this entry`, 401));
  }

  res.status(200).json({
    success: true,
    data: entry,
  });
});

// @desc    Update a journal entry
// @route   PUT /api/v1/journal/:id
// @access  Private
export const updateJournalEntry = asyncHandler(async (req, res, next) => {
  let entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(
      new ErrorResponse(
        `Journal entry not found with id of ${req.params.id}`,
        404,
      ),
    );
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to update this entry`, 401));
  }

  entry = await JournalEntry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: entry,
  });
});

// @desc    Delete a journal entry
// @route   DELETE /api/v1/journal/:id
// @access  Private
export const deleteJournalEntry = asyncHandler(async (req, res, next) => {
  const entry = await JournalEntry.findById(req.params.id);

  if (!entry) {
    return next(
      new ErrorResponse(
        `Journal entry not found with id of ${req.params.id}`,
        404,
      ),
    );
  }

  // Make sure user is owner
  if (entry.user.toString() !== req.user.id) {
    return next(new ErrorResponse(`Not authorized to delete this entry`, 401));
  }

  await entry.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
