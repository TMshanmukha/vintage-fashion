import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { getCustomers, updateUserStatus, deleteCustomer } from "../../api/userApi";
import { sendSingleEmail } from "../../api/emailApi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadUsers = async () => {
    try {
      const data = await getCustomers();
      setUsers(
        data
          .filter((u) => u.account_status !== "DELETED")
          .map((u) => ({
            id: u.user_id,
            name: u.name,
            email: u.email,
            joined: new Date(u.created_at).toLocaleDateString(),
            orders: u.orders_count,
            status: u.account_status === "ACTIVE" ? "Active" : "Blocked"
          }))
      );
    } catch (err) {
      toast.error("Failed to load users.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = async (user) => {
    const newStatus = user.status === "Active" ? "BLOCKED" : "ACTIVE";
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success(`${user.name} is now ${newStatus.toLowerCase()}.`);
      loadUsers();
    } catch (err) {
      toast.error("Failed to update status.");
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success("User removed.");
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error(err);
    }
  };

  const quickEmail = async (user) => {
    try {
      await sendSingleEmail({
        userId: user.id,
        subject: "A message from Vintage Fashion",
        body: "Thanks for being part of Vintage Fashion — here's 10% off your next order."
      });
      toast.success(`Email sent to ${user.email}`);
    } catch (err) {
      toast.error("Failed to send email.");
      console.error(err);
    }
  };

  return (
    <AdminLayout>
      <AdminTopbar title="Users" subtitle="View, manage, and message your customers." />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <div className="relative w-full sm:w-72">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors bg-white"
            />
          </div>
          <p className="text-xs text-gray-400">{filtered.length} of {users.length} users</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-xs font-bold uppercase tracking-widest text-gray-500">
                <th className="text-left px-6 py-4">User</th>
                <th className="text-left px-6 py-4">Joined</th>
                <th className="text-left px-6 py-4">Orders</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-right px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">Loading users...</td></tr>
              )}
              {!loading && filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-900 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.joined}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.orders}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.status === "Active" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => quickEmail(u)} title="Send email" className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                        </svg>
                      </button>
                      <button onClick={() => toggleStatus(u)} title="Toggle status" className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTarget(u)} title="Delete user" className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this user?"
        message={`"${deleteTarget?.name}" will lose access to their account.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}