const express = require("express");
const router = express.Router();
const goalController = require("../../controllers/goal-trcaker/goal.controller");
const validate = require("../../middlewares/validate")
const validations = require("../../validations/goal-tracker/goal.validations")

router
    .post("/",validate( validations.postGoalValidation ),goalController.createGoal)
    .get("/", goalController.getGoals);

router
    .get("/:id", goalController.getGoalsById)
    .patch("/:id", goalController.updateGoals)
    .delete("/:id", goalController.deleteGoals);

router.post("/generate-goals", goalController.getAISuggestions)    

// Steps: AI generate and toggle completion
router.post("/:id/generate-steps", goalController.generateSteps);
router.patch("/:id/steps/:stepId/toggle", goalController.toggleStep);

// Recommendations / insights
router.get("/:id/recommendations", goalController.getRecommendations);

module.exports = router;
