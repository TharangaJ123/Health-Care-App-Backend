module.exports = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { allowUnknown: true, abortEarly: false });
  if (error) {
    // TEMP DEBUG LOGS
    try {
      console.error('Validation failed. Body:', JSON.stringify(req.body));
      console.error('Validation errors:', error.details?.map(d => d.message));
    } catch {}
    const messages = error.details?.map(d => d.message) || ['Invalid request body'];
    return res.status(400).json({ error: messages.join(', ') });
  }
  next();
};
