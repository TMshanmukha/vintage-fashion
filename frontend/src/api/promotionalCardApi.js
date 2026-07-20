import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true
});

export const getCards = () => API.get("/admin/marketing/cards");

export const createCard = (formData) =>
  API.post("/admin/marketing/cards", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateCard = (id, formData) =>
  API.patch(`/admin/marketing/cards/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCard = (id) =>
  API.delete(`/admin/marketing/cards/${id}`);
