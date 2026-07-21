import axiosAdmin from "./AdminApi";

export const sendBulkEmail = async ({ subject, body }) => {
    const { data } = await axiosAdmin.post("/admin/emails/send", {
        recipientType: "all",
        subject,
        body
    });
    return data;
};

export const sendSingleEmail = async ({ userId, subject, body }) => {
    const { data } = await axiosAdmin.post("/admin/emails/send", {
        recipientType: "single",
        userId,
        subject,
        body
    });
    return data;
};

export const getEmailLog = async () => {
    const { data } = await axiosAdmin.get("/admin/emails/log");
    return data.emails;
};
