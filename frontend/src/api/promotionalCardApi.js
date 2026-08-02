import API from "./AdminApi";

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

export const setCardProducts = (cardId, productIds) =>
  API.put(`/admin/marketing/cards/${cardId}/products`, { product_ids: productIds });
