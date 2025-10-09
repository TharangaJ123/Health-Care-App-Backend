const express = require("express");
const router = express.Router();
const controller = require("../../controllers/activities/activity.controller");

router.get("/", controller.getActivities);

module.exports = router;
