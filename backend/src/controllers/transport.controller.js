import * as service from '../services/transport.service.js';

// Buses
export const listBuses = async (req, res, next) => {
  try {
    const rows = await service.listBuses(req.user?.campusId);
    res.json({ items: rows });
  } catch (e) { next(e); }
};

export const getBusById = async (req, res, next) => {
  try {
    const row = await service.getBusById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Bus not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const createBus = async (req, res, next) => {
  try {
    const row = await service.createBus({ ...req.body, campusId: req.user?.campusId });
    res.status(201).json(row);
  } catch (e) { next(e); }
};

export const updateBus = async (req, res, next) => {
  try {
    const row = await service.updateBus(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: 'Bus not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const deleteBus = async (req, res, next) => {
  try {
    await service.deleteBus(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Routes
export const listRoutes = async (req, res, next) => {
  try {
    if (req.user?.role === 'driver') {
      const items = await service.listRoutesForDriver(req.user.id);
      return res.json({ items });
    }
    res.json({ items: await service.listRoutes(req.user?.campusId) });
  } catch (e) { next(e); }
};

export const getRouteById = async (req, res, next) => {
  try {
    const row = await service.getRouteById(req.params.id);
    if (!row) return res.status(404).json({ message: 'Route not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const createRoute = async (req, res, next) => {
  try {
    const row = await service.createRoute({ ...req.body, campusId: req.user?.campusId });
    res.status(201).json(row);
  } catch (e) { next(e); }
};

export const updateRoute = async (req, res, next) => {
  try {
    const row = await service.updateRoute(req.params.id, req.body);
    if (!row) return res.status(404).json({ message: 'Route not found' });
    res.json(row);
  } catch (e) { next(e); }
};

export const deleteRoute = async (req, res, next) => {
  try {
    await service.deleteRoute(req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const listStops = async (req, res, next) => {
  try {
    const items = await service.listStops(req.params.id);
    res.json({ items });
  } catch (e) { next(e); }
};

export const addStop = async (req, res, next) => {
  try {
    const item = await service.addStop(req.params.id, req.body);
    res.status(201).json(item);
  } catch (e) { next(e); }
};

export const updateStop = async (req, res, next) => {
  try {
    const item = await service.updateStop(req.params.id, req.params.stopId, req.body);
    res.json(item);
  } catch (e) { next(e); }
};

export const removeStop = async (req, res, next) => {
  try {
    await service.removeStop(req.params.id, req.params.stopId);
    res.json({ success: true });
  } catch (e) { next(e); }
};

export const assignBusToRoute = async (req, res, next) => {
  try {
    const item = await service.assignBusToRoute(req.body.busId, req.body.routeId);
    res.json(item);
  } catch (e) { next(e); }
};

export const getStudentTransport = async (req, res, next) => {
  try {
    const data = await service.getStudentTransport(req.params.studentId);
    res.json(data);
  } catch (e) { next(e); }
};

export const setStudentTransport = async (req, res, next) => {
  try {
    const data = await service.setStudentTransport(req.params.studentId, req.body);
    res.json(data);
  } catch (e) { next(e); }
};

export const getStats = async (req, res, next) => {
  try {
    const data = await service.getTransportStats(req.user?.campusId);
    res.json(data);
  } catch (e) { next(e); }
};

export const listStudentEntries = async (req, res, next) => {
  try {
    const { q, className, busId } = req.query;
    const items = await service.listStudentTransportEntries(req.user?.campusId, { q, className, busId });
    res.json({ items });
  } catch (e) { next(e); }
};
