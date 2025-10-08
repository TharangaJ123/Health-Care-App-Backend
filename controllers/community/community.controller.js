const Community = require("../../models/community/community.model");

exports.getGroups = async (_req, res) => {
  try {
    const groups = await Community.getGroups();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRequests = async (_req, res) => {
  try {
    const requests = await Community.getRequests();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const created = await Community.createRequest(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addResponse = async (req, res) => {
  try {
    const updated = await Community.addResponse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleVerify = async (req, res) => {
  try {
    const updated = await Community.toggleVerify(req.params.id);
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.removeRequest = async (req, res) => {
  try {
    const msg = await Community.removeRequest(req.params.id);
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
