// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const goalController = require("../controllers/goalController");

router
    .post("/", goalController.createGoal)
    .get("/", goalController.getGoals);

router
    .get("/:id", goalController.getGoalsById)
    .patch("/:id", goalController.updateGoals)
    .delete("/:id", goalController.deleteGoals);

module.exports = router;
