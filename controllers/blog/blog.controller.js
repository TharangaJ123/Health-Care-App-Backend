const Blog = require("../../models/blog/blog.model");
const { summarizeBlog } = require("../../gemini-ai/client");

exports.createBlog = async (req, res) => {
  try {
    const b = req.body || {};

    let tags = [];
    if (Array.isArray(b.tags)) {
      tags = b.tags.map((t) => String(t)).filter(Boolean);
    } else if (typeof b.tags === 'string') {
      tags = b.tags.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const data = {
      title: String(b.title || '').trim(),
      excerpt: String(b.excerpt || '').trim(),
      content: String(b.content || '').trim(),
      category: String(b.category || 'General').trim(),
      date: String(b.date || new Date().toISOString().split('T')[0]).trim(),
      readTime: typeof b.readTime === 'string' ? b.readTime : String(b.readTime || ''),

      author: String(b.author || '').trim(),
      authorRole: String(b.authorRole || '').trim(),
      isAnonymous: Boolean(b.isAnonymous || false),
      isVerified: Boolean(b.isVerified || false),

      tags,
      categoryColor: String(b.categoryColor || '').trim(),
      createdAt: new Date().toISOString(),
    };

    const blog = await Blog.create(data);
    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlog = async (req, res) => {
  try {
    const blog = await Blog.getAll();
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.getById(req.params.id);
    if (!blog) return res.status(404).json({ error: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.update(req.params.id, req.body);
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBlog = async (req, res) => {
  try {
    const msg = await Blog.delete(req.params.id);
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.summarize = async (req, res) => {
  try {
    const { title = '', content = '' } = req.body || {};
    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }
    const summary = await summarizeBlog({ title, content });
    return res.status(200).json({ summary });
  } catch (err) {
    console.error('summarize error:', err);
    return res.status(500).json({ error: err.message });
  }
};
