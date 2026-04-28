import ForumPost from "../models/ForumPost.js";
import Comment from "../models/Comment.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { uniqueNamesGenerator, adjectives, animals } from "unique-names-generator";
import { Filter } from "bad-words";

const filter = new Filter();

// Helper to get or generate alias
const getOrGenerateAlias = async (userId) => {
  const user = await User.findById(userId);
  if (user.anonymousAlias) return user.anonymousAlias;

  let isUnique = false;
  let newAlias = "";
  while (!isUnique) {
    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: "",
      style: "capital",
      length: 2,
    });
    newAlias = `${randomName}${Math.floor(Math.random() * 100)}`;
    
    // Check collision
    const exists = await User.findOne({ anonymousAlias: newAlias });
    if (!exists) isUnique = true;
  }

  user.anonymousAlias = newAlias;
  await user.save();
  return newAlias;
};

// @desc    Get paginated posts
// @route   GET /api/v1/forum/posts
// @access  Private
export const getPosts = async (req, res) => {
  try {
    const { category, cursor, limit = 10 } = req.query;
    
    let query = { isHidden: false };
    if (category && category !== "All") {
      query.category = category;
    }

    if (cursor) {
      query._id = { $lt: cursor };
    }

    const posts = await ForumPost.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1); // Get one extra to check if there's a next page

    const hasNextPage = posts.length > parseInt(limit);
    const results = hasNextPage ? posts.slice(0, -1) : posts;
    const nextCursor = hasNextPage ? results[results.length - 1]._id : null;

    res.status(200).json({
      success: true,
      data: results,
      pagination: { nextCursor }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get single post
// @route   GET /api/v1/forum/posts/:id
// @access  Private
export const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post || post.isHidden) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }
    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Create new post
// @route   POST /api/v1/forum/posts
// @access  Private
export const createPost = async (req, res) => {
  try {
    const { title, content, category } = req.body;
    
    if (filter.isProfane(title) || filter.isProfane(content)) {
      return res.status(400).json({ success: false, error: "Content violates community guidelines." });
    }

    const anonymousAlias = await getOrGenerateAlias(req.user.id);

    const post = await ForumPost.create({
      authorId: req.user.id,
      anonymousAlias,
      title: filter.clean(title),
      content: filter.clean(content),
      category
    });

    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    React to post
// @route   POST /api/v1/forum/posts/:id/react
// @access  Private
export const reactToPost = async (req, res) => {
  try {
    const { type } = req.body;
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Remove existing reaction by user if exists
    post.reactions = post.reactions.filter(r => r.userId.toString() !== req.user.id);
    
    // Add new reaction
    post.reactions.push({ type, userId: req.user.id });
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Remove reaction from post
// @route   DELETE /api/v1/forum/posts/:id/react
// @access  Private
export const unreactToPost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    post.reactions = post.reactions.filter(r => r.userId.toString() !== req.user.id);
    await post.save();

    res.status(200).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Get comments for post
// @route   GET /api/v1/forum/posts/:id/comments
// @access  Private
export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id, isHidden: false }).sort({ createdAt: 1 });
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Add comment to post
// @route   POST /api/v1/forum/posts/:id/comments
// @access  Private
export const addComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    
    if (filter.isProfane(content)) {
      return res.status(400).json({ success: false, error: "Content violates community guidelines." });
    }

    const anonymousAlias = await getOrGenerateAlias(req.user.id);

    const comment = await Comment.create({
      postId: req.params.id,
      authorId: req.user.id,
      anonymousAlias,
      content: filter.clean(content),
      parentId: parentId || null
    });

    // Increment post comment count
    await ForumPost.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    React to comment
// @route   POST /api/v1/forum/comments/:id/react
// @access  Private
export const reactToComment = async (req, res) => {
  try {
    const { type } = req.body;
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ success: false, error: "Comment not found" });
    }

    comment.reactions = comment.reactions.filter(r => r.userId.toString() !== req.user.id);
    comment.reactions.push({ type, userId: req.user.id });
    await comment.save();

    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Report post
// @route   POST /api/v1/forum/posts/:id/report
// @access  Private
export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await ForumPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    // Check if user already reported
    if (post.reportedBy.includes(req.user.id)) {
      return res.status(400).json({ success: false, error: "You already reported this post" });
    }

    post.reportedBy.push(req.user.id);
    
    // Auto-hide if 3+ reports
    if (post.reportedBy.length >= 3) {
      post.isHidden = true;
    }
    await post.save();

    await Report.create({
      contentType: "post",
      contentId: post._id,
      reportedBy: req.user.id,
      reason
    });

    res.status(200).json({ success: true, message: "Post reported successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
