const Activity = require("../../models/activities/activity.model");

exports.getActivities = async (req, res) => {
  try {
    const items = await Activity.getAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
