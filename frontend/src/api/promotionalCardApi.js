import API from "./AdminApi";
import { cachedAxiosGet, invalidateCache } from "../utils/apiCache";

export const getCards = () => cachedAxiosGet(API, "/admin/marketing/cards");

export const createCard = async (formData) => {
  const res = await API.post("/admin/marketing/cards", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("cards");
  invalidateCache("marketing");
  return res;
};

export const updateCard = async (id, formData) => {
  const res = await API.patch(`/admin/marketing/cards/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  invalidateCache("cards");
  invalidateCache("marketing");
  return res;
};

export const deleteCard = async (id) => {
  const res = await API.delete(`/admin/marketing/cards/${id}`);
  invalidateCache("cards");
  invalidateCache("marketing");
  return res;
};

export const setCardProducts = async (cardId, productIds) => {
  const res = await API.put(`/admin/marketing/cards/${cardId}/products`, { product_ids: productIds });
  invalidateCache("cards");
  invalidateCache("marketing");
  return res;
};
