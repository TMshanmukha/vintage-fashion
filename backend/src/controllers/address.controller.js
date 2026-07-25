import {
    listAddressesService,
    addAddressService
} from "../services/address.service.js";

export const listAddresses = async (req, res, next) => {

    try {

        const addresses = await listAddressesService(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Addresses fetched successfully.",
            data: addresses
        });

    } catch (error) {

        next(error);

    }

};

export const addAddress = async (req, res, next) => {

    try {

        const address = await addAddressService(req.user.userId, req.body);

        return res.status(201).json({
            success: true,
            message: "Address added successfully.",
            data: address
        });

    } catch (error) {

        next(error);

    }

};
