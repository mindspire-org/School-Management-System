import { getOverview, getAttendanceWeekly, getFeesMonthly } from '../services/dashboard.service.js';

export const overview = async (req, res, next) => {
  try {
    const data = await getOverview(req.user?.campusId);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const attendanceWeekly = async (req, res, next) => {
  try {
    const data = await getAttendanceWeekly(req.user?.campusId);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export const feesMonthly = async (req, res, next) => {
  try {
    const data = await getFeesMonthly(req.user?.campusId);
    return res.json({ success: true, data });
  } catch (err) {
    return next(err);
  }
};

export default { overview, attendanceWeekly, feesMonthly };
