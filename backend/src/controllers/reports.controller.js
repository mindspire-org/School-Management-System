import * as service from '../services/reports.service.js';

export const overview = async (req, res, next) => {
  try {
    const campusId = req.user?.campusId;
    const data = await service.getOverview({ campusId });
    res.json(data);
  } catch (e) { next(e); }
};

export const attendanceSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate, class: klass, section, roll } = req.query;
    const campusId = req.user?.campusId;
    const data = await service.getAttendanceSummary({ fromDate, toDate, klass, section, roll, campusId });
    res.json(data);
  } catch (e) { next(e); }
};

export const financeSummary = async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;
    const campusId = req.user?.campusId;
    const data = await service.getFinanceSummary({ fromDate, toDate, campusId });
    res.json(data);
  } catch (e) { next(e); }
};

export const examPerformance = async (req, res, next) => {
  try {
    const { examId } = req.query;
    const campusId = req.user?.campusId;
    const data = await service.getExamPerformance({ examId, campusId });
    res.json({ items: data });
  } catch (e) { next(e); }
};

export const attendanceByClass = async (req, res, next) => {
  try {
    const { fromDate, toDate, class: klass, section, roll } = req.query;
    const campusId = req.user?.campusId;
    const rows = await service.getAttendanceByClass({ fromDate, toDate, klass, section, roll, campusId });
    res.json({ items: rows });
  } catch (e) { next(e); }
};

export const attendanceHeatmap = async (req, res, next) => {
  try {
    const { fromDate, toDate, class: klass, section, location } = req.query;
    const campusId = req.user?.campusId;
    const data = await service.getAttendanceHeatmap({ fromDate, toDate, klass, section, location, campusId });
    res.json(data);
  } catch (e) { next(e); }
};
