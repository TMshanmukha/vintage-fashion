import { createAddress, getAddressesByUser } from "../models/address.model.js";
import { addressSchema } from "../validators/address.validator.js";

export const listAddressesService = async (userId) => {
    return await getAddressesByUser(userId);
};

export const addAddressService = async (userId, body) => {

    const validated = addressSchema.parse(body);

    const addressId = await createAddress(userId, validated);

    return { address_id: addressId, ...validated };

};
