import axios from "axios";

const API_BASE = "http://localhost:3000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const fetchNotes = async () => {
  const res = await axios.get(`${API_BASE}/notes`, {
    headers: getAuthHeaders(),
  });
  return res.data.data;
};

export const createNote = async (title: string, content: string) => {
  const res = await axios.post(
    `${API_BASE}/notes`,
    { title, content },
    { headers: getAuthHeaders() }
  );
  return res.data.data;
};

export const updateNote = async (id: string, title: string, content: string) => {
  const res = await axios.put(
    `${API_BASE}/notes/${id}`,
    { title, content },
    { headers: getAuthHeaders() }
  );
  return res.data.data;
};

export const deleteNote = async (id: string) => {
  await axios.delete(`${API_BASE}/notes/${id}`, {
    headers: getAuthHeaders(),
  });
};

export const archiveNote = async (id: string) => {
  await axios.patch(
    `${API_BASE}/notes/${id}/archive`,
    {},
    { headers: getAuthHeaders() }
  );
};
