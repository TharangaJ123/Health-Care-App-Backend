const Goal = require("../../models/goal-tracker/goal.model");
const { generateGoals, generateGoalSteps, generateGoalRecommendations } = require("../../gemini-ai/client");

exports.createGoal = async (req, res) => {
  try {
    const userId = (req.body && (req.body.userId || req.body.uid)) || req.query.userId || null;
    const payload = { ...req.body };
    if (userId) payload.userId = String(userId);
    const goal = await Goal.create(payload);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAISuggestions = async (req, res) => {
  try {
    const suggestions = await generateGoals(req.body || {});
    return res.status(200).json({ suggestions });
  } catch (err) {
    console.error("getAISuggestions error:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const qUserId = req.query && (req.query.userId || req.query.uid);
    if (!qUserId) {
      // Do not expose all goals when userId is not specified
      return res.json([]);
    }
    const goal = await Goal.getByUserId(String(qUserId));
    return res.json(goal);
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

exports.generateSteps = async (req, res) => {
  try {
    const id = req.params.id;
    const goal = await Goal.getById(id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    // Idempotent behavior: if steps already exist and client didn't request force, return them
    const force = String(req.query.force || '').toLowerCase() === 'true';
    if (!force && Array.isArray(goal.steps) && goal.steps.length > 0) {
      return res.json({ id, steps: goal.steps, alreadyGenerated: true });
    }

    const aiSteps = await generateGoalSteps({
      title: goal.title || goal.name || '',
      description: goal.description || '',
      durationDays: Number(goal.durationDays || 7),
    });

    // Normalize steps
    const normalized = (aiSteps || []).map((s, idx) => ({
      id: String(s.id || `step-${idx + 1}`),
      title: String(s.title || `Step ${idx + 1}`),
      description: String(s.description || ''),
      order: Number(s.order || idx + 1),
      completed: false,
      completedAt: null,
    }))
    .sort((a, b) => (a.order || 0) - (b.order || 0));

    // Compute schedule across goal duration
    const durationDays = Math.max(1, Number(goal.durationDays || 7));
    const stepCount = normalized.length || 1;
    const perStepBase = Math.max(1, Math.floor(durationDays / stepCount));
    let remainder = Math.max(0, durationDays - perStepBase * stepCount);

    // Start date preference: goal.date -> goal.createdAt -> today
    const startDateISO = (goal.date && new Date(goal.date).toString() !== 'Invalid Date')
      ? new Date(goal.date)
      : (goal.createdAt ? new Date(goal.createdAt) : new Date());

    let cursor = new Date(startDateISO);
    const steps = normalized.map((s, idx) => {
      const extra = remainder > 0 ? 1 : 0; // distribute remainders to earliest steps
      if (remainder > 0) remainder -= 1;
      const segmentDays = perStepBase + extra;
      const start = new Date(cursor);
      // due date is inclusive end of segment
      const due = new Date(start);
      due.setDate(due.getDate() + segmentDays - 1);

      // move cursor to next day after segment
      cursor.setDate(cursor.getDate() + segmentDays);

      return {
        ...s,
        dayOffset: Math.max(0, Math.round((start.getTime() - startDateISO.getTime()) / (24 * 3600 * 1000))),
        startDate: start.toISOString().split('T')[0],
        dueDate: due.toISOString().split('T')[0],
      };
    });

    await Goal.update(id, { steps });
    return res.json({ id, steps, alreadyGenerated: false });
  } catch (err) {
    console.error('generateSteps error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.toggleStep = async (req, res) => {
  try {
    const { id, stepId } = req.params;
    const goal = await Goal.getById(id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    if (!Array.isArray(goal.steps)) return res.status(400).json({ error: "No steps for this goal" });

    const byId = goal.steps.find((s) => String(s.id) === String(stepId));
    if (!byId) return res.status(404).json({ error: "Step not found" });
    const markingComplete = !byId.completed;
    if (markingComplete) {
      const priorIncomplete = goal.steps
        .filter((s) => (s.order || 0) < (byId.order || 0))
        .some((s) => !s.completed);
      if (priorIncomplete) {
        return res.status(400).json({ error: "Complete previous steps first", code: 'PREREQUISITE_INCOMPLETE' });
      }
    }

    const steps = goal.steps.map((s) => {
      if (String(s.id) === String(stepId)) {
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      }
      return s;
    });

    const allDone = steps.length > 0 && steps.every((s) => !!s.completed);
    const patch = { steps };
    if (allDone) {
      patch.completed = true;
      patch.completedAt = new Date().toISOString();
    } else if (goal.completed) {
      patch.completed = false;
      patch.completedAt = null;
    }

    await Goal.update(id, patch);
    return res.json({ id, steps, completed: !!patch.completed, completedAt: patch.completedAt || goal.completedAt || null });
  } catch (err) {
    console.error('toggleStep error:', err);
    return res.status(500).json({ error: err.message });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const id = req.params.id;
    const goal = await Goal.getById(id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });
    const text = await generateGoalRecommendations({
      title: goal.title || goal.name || '',
      description: goal.description || '',
      steps: Array.isArray(goal.steps) ? goal.steps : [],
      durationDays: Number(goal.durationDays || 0),
    });
    return res.json({ recommendations: text });
  } catch (err) {
    console.error('getRecommendations error:', err);
    return res.status(500).json({ error: err.message });
  }
};
