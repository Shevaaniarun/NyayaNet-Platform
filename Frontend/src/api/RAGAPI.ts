import axios from "axios";

const AI_API = axios.create({
  baseURL: "http://localhost:8000",
});

export const nyayanetAI = {
  ask: async (query: string, top_k = 5) => {
    const res = await AI_API.post("/ask", { query, top_k });
    return res.data;
  },
};