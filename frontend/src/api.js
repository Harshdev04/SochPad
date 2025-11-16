import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API = axios.create({ baseURL: BASE });

export const listNotes = (q = '') => API.get('/notes', { params: { q } }).then(r => r.data);
export const getNote = (id) => API.get(`/notes/${id}`).then(r => r.data);
export const createNote = (payload) => API.post('/notes', payload).then(r => r.data);
export const updateNote = (id, payload) => API.put(`/notes/${id}`, payload).then(r => r.data);
export const deleteNote = (id) => API.delete(`/notes/${id}`).then(r => r.data);
