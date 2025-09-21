// backend/routes/posts.js
import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const posts = await Post.find().populate('user').sort({ createdAt: -1 });
  res.json(posts);
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  const post = new Post({
    user: req.user._id,
    content: req.body.content,
    image: req.file ? req.file.path : undefined
  });
  await post.save();
  res.json(post);
});

router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found' });
  const already = post.likes.includes(req.user._id);
  if (already) post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
  else post.likes.push(req.user._id);
  await post.save();
  res.json(post);
});

export default router;
