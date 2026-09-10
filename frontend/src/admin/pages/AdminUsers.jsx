import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import toast from "react-hot-toast";
import { getCustomers, updateUserStatus, deleteCustomer } from "../../api/userApi";

const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const getAvatarColor = (name = "") => {
  const colors = [
    "from-pink-500 to-rose-600",
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-purple-700",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getCustomers();
      const raw = Array.isArray(data) ? data : data?.data || [];
      setUsers(
        raw
          .filter((u) => u.account_status !== "DELETED")
          .map((u) => ({
            id: u.user_id,
            name: u.name || "Customer",
            email: u.email || "—",
            phone: u.phone || "—",
            joined: u.created_at
              ? new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : "—",
            orders: Number(u.orders_count || 0),
            status: u.account_status === "BLOCKED" ? "Blocked" : "Active",
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

  const stats = useMemo(() => {
    const totalCount = users.length;
    const activeCount = users.filter((u) => u.status === "Active").length;
    const blockedCount = users.filter((u) => u.status === "Blocked").length;
    const totalOrders = users.reduce((acc, u) => acc + u.orders, 0);

    return { totalCount, activeCount, blockedCount, totalOrders };
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        u.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

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
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteCustomer(deleteTarget.id);
      toast.success("User account removed.");
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user.");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const handleEmailUser = (user) => {
    navigate(
      `/admin/emails?userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`
    );
  };

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Customer Accounts"
          description="View registered shoppers, monitor lifetime order activity, and manage account statuses"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Stats KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Customers</span>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalCount}</p>
              <p className="text-xs text-gray-400 mt-1">Registered buyer base</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active Shoppers</span>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-700 mt-2">{stats.activeCount}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Healthy standing</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200/80 shadow-sm bg-gradient-to-br from-white to-red-50/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">Blocked Users</span>
              <p className="text-2xl sm:text-3xl font-bold text-red-700 mt-2">{stats.blockedCount}</p>
              <p className="text-xs text-red-600 font-medium mt-1">Suspended access</p>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-indigo-200/80 shadow-sm bg-gradient-to-br from-white to-indigo-50/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Orders Placed</span>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-700 mt-2">{stats.totalOrders}</p>
              <p className="text-xs text-indigo-600 font-medium mt-1">Total customer purchases</p>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search customers by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 bg-gray-50/50"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
                {["all", "active", "blocked"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                      statusFilter === tab
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <p className="text-xs font-semibold text-gray-500 whitespace-nowrap">
                {filtered.length} of {users.length} users
              </p>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Loading customer accounts...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <div className="text-4xl">👥</div>
                <h3 className="text-sm font-semibold text-gray-800">No Customers Found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  {search
                    ? `No users match "${search}". Try clearing your search keyword.`
                    : "No customers match the current filter."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-gray-50/80 text-[11px] font-bold uppercase tracking-wider text-gray-600 border-b border-gray-200">
                    <tr>
                      <th className="py-4 px-5">Customer Profile</th>
                      <th className="py-4 px-5">Member Since</th>
                      <th className="py-4 px-5">Total Orders</th>
                      <th className="py-4 px-5">Account Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* User Profile */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(u.name)} text-white font-bold flex items-center justify-center text-xs shadow-xs flex-shrink-0`}>
                              {getInitials(u.name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-xs truncate max-w-xs">{u.name}</p>
                              <p className="text-[11px] text-gray-400 truncate max-w-xs">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-5 text-gray-600 font-medium">
                          {u.joined}
                        </td>

                        {/* Orders Count */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                            u.orders > 0
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {u.orders} {u.orders === 1 ? "order" : "orders"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            u.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-red-500"}`} />
                            {u.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEmailUser(u)}
                              title="Send Email to Customer"
                              className="p-2 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors border border-transparent hover:border-pink-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                              </svg>
                            </button>

                            <button
                              onClick={() => toggleStatus(u)}
                              title={u.status === "Active" ? "Block Customer" : "Unblock Customer"}
                              className={`p-2 rounded-xl transition-colors border border-transparent ${
                                u.status === "Active"
                                  ? "text-gray-500 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200"
                                  : "text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                              }`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                              </svg>
                            </button>

                            <button
                              onClick={() => setDeleteTarget(u)}
                              title="Delete Customer Account"
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete User Modal */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Customer Account?"
        message={`Are you sure you want to permanently remove "${deleteTarget?.name}"? All associated account history will be archived.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}