import { getNextSequence } from "../services/sequence.service.js";

export const generateOrderNumber = async () => {
    return await getNextSequence("order");
};
