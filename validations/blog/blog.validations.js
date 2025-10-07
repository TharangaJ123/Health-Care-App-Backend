const Joi = require("joi");

exports.postBlogValidation = Joi.object({
  // Required core fields
  title: Joi.string().trim().required(),
  excerpt: Joi.string().trim().required(),
  content: Joi.string().trim().required(),

  // Optional metadata
  category: Joi.string().trim().default('General'),
  date: Joi.string().trim(), // YYYY-MM-DD from client
  readTime: Joi.string().trim().allow(''),

  // Author information
  author: Joi.string().trim().allow(''), // may be "Anonymous"
  authorRole: Joi.string().trim().allow(''),
  isAnonymous: Joi.boolean().default(false),

  // Engagement
  isVerified: Joi.boolean().default(false),

  // Tags can be CSV string or array
  tags: Joi.alternatives(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim().allow('')
  ).default([]),

  // UI color hint
  categoryColor: Joi.string().trim().allow(''),
});
