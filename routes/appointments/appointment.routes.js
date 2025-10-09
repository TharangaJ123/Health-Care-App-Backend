const express = require("express");
const router = express.Router();
const controller = require("../../controllers/appointments/appointment.controller");
const validate = require("../../middlewares/validate");
const { postAppointmentValidation } = require("../../validations/appointments/appointment.validations");

router
  .post("/", validate(postAppointmentValidation), controller.createAppointment)
  .get("/", controller.getAppointments);

router
  .get("/:id", controller.getAppointmentById)
  .patch("/:id", controller.updateAppointment)
  .delete("/:id", controller.deleteAppointment);

module.exports = router;
