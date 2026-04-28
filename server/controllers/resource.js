import Article from "../models/Article.js";
import asyncHandler from "../middleware/async.js";

// @desc    Get all published articles
// @route   GET /api/v1/resources/articles
// @access  Public
export const getArticles = asyncHandler(async (req, res, next) => {
  const { category, search } = req.query;
  
  let query = { isPublished: true };
  
  if (category && category !== "All") {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } }
    ];
  }

  const articles = await Article.find(query).sort({ publishedAt: -1 });

  res.status(200).json({
    success: true,
    count: articles.length,
    data: articles,
  });
});

// @desc    Get single article
// @route   GET /api/v1/resources/articles/:id
// @access  Public
export const getArticle = asyncHandler(async (req, res, next) => {
  const article = await Article.findById(req.params.id);

  if (!article || !article.isPublished) {
    return res.status(404).json({ success: false, error: "Article not found" });
  }

  res.status(200).json({
    success: true,
    data: article,
  });
});
