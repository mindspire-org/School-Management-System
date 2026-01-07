import jwt from 'jsonwebtoken';

export const signAccessToken = (payload, options = {}) => {
  const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign(payload, secret, { expiresIn, ...options });
};

export const signRefreshToken = (payload, options = {}) => {
  const secret = process.env.REFRESH_SECRET || 'dev_refresh_secret';
  const expiresIn = process.env.REFRESH_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn, ...options });
};

export const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret');
export const verifyRefreshToken = (token) => jwt.verify(token, process.env.REFRESH_SECRET || 'dev_refresh_secret');
