const asyncHandler = require('../utils/asyncHandler');

exports.tracking = asyncHandler(async (req, res) => {
  // Stub payload compatible with DriverDashboard UI
  const payload = {
    routeName: 'Route A - North Loop',
    stops: 18,
    progress: 62,
    gpsStatus: 'Connected',
    nextStop: 'Stop #7 - Oak Street',
    eta: '08:42 AM',
    vehicleId: 'BUS-12',
    capacity: '48 seats',
    shift: { start: '07:30 AM', end: '02:30 PM' },
    lastUpdate: '1 min ago',
    speed: '36 km/h',
    speedTrend: [28, 32, 30, 35, 36, 31, 34, 38, 33, 36, 37, 35],
  };
  res.json(payload);
});

exports.routes = asyncHandler(async (req, res) => {
  const routes = [
    { id: 'A', name: 'Route A - North Loop', stops: 18 },
    { id: 'B', name: 'Route B - East Loop', stops: 16 },
  ];
  res.json(routes);
});
