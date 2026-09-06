// backend/routes/posts.js
import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 15));
    const query = { isPublic: true };
    if (req.query.category) query.category = req.query.category;
    const [posts, total] = await Promise.all([
      Post.find(query).populate('user', 'name profileImage').populate('comments.user', 'name profileImage').populate('attachedWorkout', 'title date exercises durationMinutes totalVolume').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Post.countDocuments(query)
    ]);
    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: page * limit < total } });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to load posts', error: error.message }); }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ success: false, message: 'Post content is required.' });
    const category = ['General', 'PRs', 'Tips', 'Motivation', 'Nutrition', 'Progress'].includes(req.body.category) ? req.body.category : 'General';
    const attachedWorkout = mongoose.Types.ObjectId.isValid(req.body.attachedWorkout) ? req.body.attachedWorkout : null;
    const attachedPR = typeof req.body.attachedPR === 'string' ? JSON.parse(req.body.attachedPR || '{}') : req.body.attachedPR;
    const post = await Post.create({ user: req.user._id, content, category, image: req.file?.path, attachedWorkout, attachedPR, isPublic: req.body.isPublic !== false && req.body.isPublic !== 'false' });
    await post.populate('user', 'name profileImage');
    res.status(201).json({ success: true, post });
  } catch (error) { res.status(400).json({ success: false, message: 'Unable to create post', error: error.message }); }
});

router.post('/:id/like', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post ID.' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const viewer = String(req.user._id);
    const already = post.likes.some((id) => String(id) === viewer);
    post.likes = already ? post.likes.filter((id) => String(id) !== viewer) : [...post.likes, req.user._id];
    await post.save();
    res.json({ success: true, liked: !already, likes: post.likes.length, post });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to update like', error: error.message }); }
});

router.post('/:id/comment', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post ID.' });
    const content = String(req.body.content || '').trim();
    if (!content) return res.status(400).json({ success: false, message: 'Comment is required.' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    post.comments.push({ user: req.user._id, content });
    await post.save();
    await post.populate('comments.user', 'name profileImage');
    res.status(201).json({ success: true, comments: post.comments });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to add comment', error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid post ID.' });
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found or not owned by you.' });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (error) { res.status(500).json({ success: false, message: 'Unable to delete post', error: error.message }); }
});

export default router;
