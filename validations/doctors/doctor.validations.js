const Joi = require("joi");

exports.postDoctorValidation = Joi.object({
  name: Joi.string().min(2).required(),
  specialization: Joi.string().min(2).required(),
  bio: Joi.string().allow(""),
  phone: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  location: Joi.string().allow(""),
});

exports.patchDoctorValidation = Joi.object({
  name: Joi.string().min(2),
  specialization: Joi.string().min(2),
  bio: Joi.string().allow(""),
  phone: Joi.string().allow(""),
  email: Joi.string().email().allow(""),
  location: Joi.string().allow(""),
}).min(1);
