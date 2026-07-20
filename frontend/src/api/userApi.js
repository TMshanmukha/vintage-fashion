import axiosAdmin from "./axiosAdmin";

export const getCustomers = async () => {
    const { data } = await axiosAdmin.get("/admin/users");
    return data.users;
};

export const updateUserStatus = async (userId, status) => {
    const { data } = await axiosAdmin.patch(`/admin/users/${userId}/status`, { status });
    return data;
};

export const deleteCustomer = async (userId) => {
    const { data } = await axiosAdmin.delete(`/admin/users/${userId}`);
    return data;
};
