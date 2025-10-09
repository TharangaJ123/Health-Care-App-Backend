const Joi = require("joi");

exports.postAppointmentValidation = Joi.object({
  doctorId: Joi.string().required(),
  doctorName: Joi.string().optional(),
  doctorSpecialization: Joi.string().optional(),
  patientName: Joi.string().required(),
  price: Joi.number().optional(),
  messageToDoctor: Joi.string().allow("", null).optional(),
  appointmentDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  appointmentTime: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
  reason: Joi.string().allow("", null),
});
