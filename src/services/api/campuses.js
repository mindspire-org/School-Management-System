import { http } from '../http';

export const list = async (params) => {
    const res = await http.get('/campuses', { params });
    // Handle both { data: { rows } } and { rows } (http implementation returns payload directly)
    return res?.data || res;
};

export const getById = async (id) => {
    const res = await http.get(`/campuses/${id}`);
    return res?.data || res;
};

export const create = async (data) => {
    const res = await http.post('/campuses', data);
    return res?.data || res;
};

export const update = async (id, data) => {
    const res = await http.put(`/campuses/${id}`, data);
    return res?.data || res;
};

export const remove = async (id) => {
    const res = await http.delete(`/campuses/${id}`);
    return res?.data || res;
};
