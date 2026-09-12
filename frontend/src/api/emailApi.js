import axiosAdmin from "./AdminApi";

export const sendBulkEmail = async ({ subject, body, imageUrl, imageFile }) => {
    if (imageFile) {
        const formData = new FormData();
        formData.append("recipientType", "all");
        formData.append("subject", subject);
        formData.append("body", body);
        formData.append("image", imageFile);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const { data } = await axiosAdmin.post("/admin/emails/send", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return data;
    }

    const { data } = await axiosAdmin.post("/admin/emails/send", {
        recipientType: "all",
        subject,
        body,
        imageUrl: imageUrl || null,
        image_url: imageUrl || null,
        bannerUrl: imageUrl || null
    });
    return data;
};

export const sendSingleEmail = async ({ userId, subject, body, imageUrl, imageFile }) => {
    if (imageFile) {
        const formData = new FormData();
        formData.append("recipientType", "single");
        formData.append("userId", userId);
        formData.append("subject", subject);
        formData.append("body", body);
        formData.append("image", imageFile);
        if (imageUrl) formData.append("imageUrl", imageUrl);

        const { data } = await axiosAdmin.post("/admin/emails/send", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return data;
    }

    const { data } = await axiosAdmin.post("/admin/emails/send", {
        recipientType: "single",
        userId,
        subject,
        body,
        imageUrl: imageUrl || null,
        image_url: imageUrl || null,
        bannerUrl: imageUrl || null
    });
    return data;
};

export const getEmailLog = async () => {
    const { data } = await axiosAdmin.get("/admin/emails/log");
    return data.emails;
};
