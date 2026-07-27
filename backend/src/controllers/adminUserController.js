import * as UserAdminService from "../services/userAdminService.js";

export const listCustomers = async (req, res) => {
    try {
        const users = await UserAdminService.listCustomers();
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch users." });
    }
};

// body: { status: "ACTIVE" | "BLOCKED" }
export const toggleStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!["ACTIVE", "BLOCKED"].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        const user = await UserAdminService.toggleUserStatus(userId, status);
        if (!user) return res.status(404).json({ message: "User not found." });

        res.json({ message: "User status updated." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to update user status." });
    }
};

export const removeCustomer = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserAdminService.removeCustomer(userId);
        if (!user) return res.status(404).json({ message: "User not found." });

        res.json({ message: "User removed." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete user." });
    }
};
