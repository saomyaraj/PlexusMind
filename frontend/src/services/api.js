//----------------------------------------------------
// src/services/api.js
//----------------------------------------------------
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Notes API
export const createNote = async (noteData) => {
  const response = await api.post('/notes', noteData);
  return response.data;
};

export const getNotes = async () => {
  const response = await api.get('/notes');
  return response.data;
};

export const getNote = async (id) => {
  const response = await api.get(`/notes/${id}`);
  return response.data;
};

export const updateNote = async (id, noteData) => {
  const response = await api.put(`/notes/${id}`, noteData);
  return response.data;
};

export const deleteNote = async (id) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};

// Graph API
export const getGraphData = async () => {
  const response = await api.get('/graph/data');
  return response.data;
};

export const analyzeGraph = async () => {
  const response = await api.get('/graph/analyze');
  return response.data;
};

export const getRelatedNotes = async (noteId) => {
  const response = await api.get(`/graph/related/${noteId}`);
  return response.data;
};

export const findPathBetweenNotes = async (sourceId, targetId) => {
  const response = await api.get(`/graph/path/${sourceId}/${targetId}`);
  return response.data;
};

// Links API
export const createManualLink = async (linkData) => {
  const response = await api.post('/links/manual', linkData);
  return response.data;
};

export const getLinksForNote = async (noteId) => {
  const response = await api.get(`/links/note/${noteId}`);
  return response.data;
};

export const updateLink = async (linkId, metadata) => {
  const response = await api.put(`/links/${linkId}`, { metadata });
  return response.data;
};

export const deleteLink = async (linkId) => {
  const response = await api.delete(`/links/${linkId}`);
  return response.data;
};

export const getStrongestLinks = async (threshold = 0.7) => {
  const response = await api.get(`/links/strongest?threshold=${threshold}`);
  return response.data;
};

// Error handler middleware
api.interceptors.response.use(
  response => response,
  error => {
    const message = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', message);
    throw new Error(message);
  }
);