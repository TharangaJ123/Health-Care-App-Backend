const Joi = require("joi");

exports.postGoalValidation = Joi.object({
  name: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  priority: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  time: Joi.string().required(),
  completed: Joi.boolean().required(),
  createdAt: Joi.string().required()
});
