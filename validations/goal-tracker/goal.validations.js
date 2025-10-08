const Joi = require("joi");

exports.postGoalValidation = Joi.object({
  name: Joi.string().required(),
  startDate: Joi.string().required(),
  endDate: Joi.string().required(),
  priority: Joi.string().required(),
});
