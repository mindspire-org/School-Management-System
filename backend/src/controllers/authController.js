const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config/env');

const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role, email: user.email }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
  const user = await User.create({ name, email, password, role });
  const token = signToken(user);
  res.status(201).json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
});

exports.profile = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

exports.logout = asyncHandler(async (req, res) => {
  // For stateless JWT, logout is a no-op on server; client should discard token.
  res.json({ success: true, message: 'Logged out' });
});

exports.refresh = asyncHandler(async (req, res) => {
  // Issue a new access token from the current user context
  // Expect existing token verified by auth middleware
  const user = await User.findByPk(req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  const token = signToken(user);
  res.json({ success: true, token });
});
