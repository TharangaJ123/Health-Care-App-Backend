const Joi = require("joi");

exports.postBlogValidation = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  author: Joi.string().required(),
});
