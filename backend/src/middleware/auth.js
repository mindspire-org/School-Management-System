import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const secret = process.env.JWT_SECRET || 'dev_jwt_secret';
    const payload = jwt.verify(token, secret);
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.length) return next();
  const role = req.user?.role;
  if (!role || !roles.includes(role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
