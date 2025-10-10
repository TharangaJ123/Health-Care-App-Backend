const User = require('../../models/userModel');

exports.getUsers = async (req, res) => {
  try {
    const { userType } = req.query;
    const users = await User.getAll({ userType });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to fetch user' });
  }
};
