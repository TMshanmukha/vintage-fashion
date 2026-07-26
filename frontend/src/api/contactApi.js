import API from "./API";

export const submitContactForm = async (formData) => {
  const { data } = await API.post("/contact", formData);
  return data;
};
