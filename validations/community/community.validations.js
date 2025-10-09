const Joi = require("joi");

exports.postRequestValidation = Joi.object({
  medicineName: Joi.string().required(),
  details: Joi.string().allow(""),
  groupId: Joi.string().required(),
  groupName: Joi.string().required(),
  urgent: Joi.boolean().default(false),
});

exports.addResponseValidation = Joi.object({
  text: Joi.string().min(1).required(),
  from: Joi.string().allow("", null),
});
