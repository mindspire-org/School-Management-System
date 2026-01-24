import { http } from '../http';

export const listBuses = () => http.get('/transport/buses');
export const listRoutes = () => http.get('/transport/routes');
export const listRouteStops = (routeId) => http.get(`/transport/routes/${routeId}/stops`);
