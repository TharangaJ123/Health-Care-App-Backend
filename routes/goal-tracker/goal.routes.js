const express = require("express");
const router = express.Router();
const goalController = require("../../controllers/goal-trcaker/goal.controller");
const validate = require("../../middlewares/validate")
const {postGoalValidation} = require("../../validations/goal-tracker/goal.validations")

router
    .post("/",validate(postGoalValidation),goalController.createGoal)
    .get("/", goalController.getGoals);

router
    .get("/:id", goalController.getGoalsById)
    .patch("/:id", goalController.updateGoals)
    .delete("/:id", goalController.deleteGoals);

module.exports = router;
