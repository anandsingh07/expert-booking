import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });


export const getExperts = (params) => API.get('/experts', { params });
export const getExpertById = (id) => API.get(`/experts/${id}`);
export const createBooking = (data) => API.post('/bookings', data);
export const getBookingsByEmail = (email) => API.get('/bookings', { params: { email } });
export const updateBookingStatus = (id, status) => API.patch(`/bookings/${id}/status`, { status });
