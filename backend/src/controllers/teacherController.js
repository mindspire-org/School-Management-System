const { Teacher, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const items = await Teacher.findAll({
    include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(items);
});

exports.get = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const item = await Teacher.findByPk(id, { include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }] });
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  res.json(item);
});

exports.create = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  if (payload.user) {
    payload.userId = payload.userId || payload.user;
    delete payload.user;
  }
  const item = await Teacher.create(payload);
  res.status(201).json(item);
});

exports.update = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const payload = { ...req.body };
  if (payload.user) {
    payload.userId = payload.userId || payload.user;
    delete payload.user;
  }
  const item = await Teacher.findByPk(id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  await item.update(payload);
  res.json(item);
});

exports.remove = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const item = await Teacher.findByPk(id);
  if (!item) return res.status(404).json({ success: false, message: 'Not found' });
  await item.destroy();
  res.json({ success: true });
});

exports.schedule = asyncHandler(async (req, res) => {
  // Placeholder schedule data; structure aligns with frontend expectations
  const { id } = req.params;
  const schedule = [
    { day: 'Monday', timeSlot: 1, class: '10A', subject: 'Mathematics', room: 'R101', teacherId: id },
    { day: 'Tuesday', timeSlot: 2, class: '9A', subject: 'Biology', room: 'R102', teacherId: id },
  ];
  res.json(schedule);
});
