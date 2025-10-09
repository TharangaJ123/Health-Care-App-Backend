const express = require("express");
const router = express.Router();
const controller = require("../../controllers/doctors/doctor.controller");
const validate = require("../../middlewares/validate");
const { postDoctorValidation, patchDoctorValidation } = require("../../validations/doctors/doctor.validations");

router
  .post("/", validate(postDoctorValidation), controller.createDoctor)
  .get("/", controller.getDoctors);

router
  .get("/:id/profile", controller.getDoctorProfile)
  .put("/:id/profile", validate(patchDoctorValidation), controller.updateDoctor)
  .delete("/:id/profile", controller.deleteDoctor)
  .get("/:id", controller.getDoctorById)
  .patch("/:id", validate(patchDoctorValidation), controller.updateDoctor)
  .delete("/:id", controller.deleteDoctor);

module.exports = router;
