const Goal = require("../../models/goal-tracker/goal.model");

exports.createGoal = async (req, res) => {
  try {
    const goal = await Goal.create(req.body);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goal = await Goal.getAll();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGoalsById = async (req, res) => {
  try {
    const goal = await Goal.getById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGoals = async (req, res) => {
  try {
    const goal = await Goal.update(req.params.id, req.body);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGoals = async (req, res) => {
  try {
    const msg = await Goal.delete(req.params.id);
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
