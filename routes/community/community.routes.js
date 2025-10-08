const express = require("express");
const router = express.Router();
const controller = require("../../controllers/community/community.controller");
const validate = require("../../middlewares/validate");
const { postRequestValidation, addResponseValidation } = require("../../validations/community/community.validations");

// Groups
router.get("/groups", controller.getGroups);

// Requests
router
  .get("/requests", controller.getRequests)
  .post("/requests", validate(postRequestValidation), controller.createRequest);

// Request actions
router
  .post("/requests/:id/responses", validate(addResponseValidation), controller.addResponse)
  .post("/requests/:id/toggle-verify", controller.toggleVerify)
  .delete("/requests/:id", controller.removeRequest);

module.exports = router;
