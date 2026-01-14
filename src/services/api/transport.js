import { http } from '../http';

export const listBuses = () => http.get('/transport/buses');
export const createBus = (data) => http.post('/transport/buses', data);
export const updateBus = (id, data) => http.put(`/transport/buses/${id}`, data);
export const deleteBus = (id) => http.delete(`/transport/buses/${id}`);

export const listRoutes = () => http.get('/transport/routes');
export const listRouteStops = (routeId) => http.get(`/transport/routes/${routeId}/stops`);
export const createRoute = (data) => http.post('/transport/routes', data);
export const updateRoute = (id, data) => http.put(`/transport/routes/${id}`, data);
export const deleteRoute = (id) => http.delete(`/transport/routes/${id}`);

export const addStop = (routeId, data) => http.post(`/transport/routes/${routeId}/stops`, data);
export const updateStop = (routeId, stopId, data) => http.put(`/transport/routes/${routeId}/stops/${stopId}`, data);
export const removeStop = (routeId, stopId) => http.delete(`/transport/routes/${routeId}/stops/${stopId}`);

export const assignBus = (busId, routeId) => http.post('/transport/assign-bus', { busId, routeId });
