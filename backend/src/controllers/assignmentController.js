const { Assignment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const items = await Assignment.findAll({ order: [['createdAt', 'DESC']] });
  res.json(items);
});

exports.get = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const item = await Assignment.findByPk(id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json(item);
});

exports.create = asyncHandler(async (req, res) => {
  const data = { ...req.body, teacherId: req.user?.id };
  const item = await Assignment.create(data);
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const item = await Assignment.findByPk(id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  await item.update(req.body);
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const item = await Assignment.findByPk(id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

exports.submit = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { content } = req.body;
  const assignment = await Assignment.findByPk(id);
  if (!assignment) return res.status(404).json({ success: false, message: 'Not found' });
  const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
  submissions.push({ studentId: req.user?.id, content, submittedAt: new Date().toISOString() });
  assignment.submissions = submissions;
  await assignment.save();
  res.status(201).json(assignment);
});
