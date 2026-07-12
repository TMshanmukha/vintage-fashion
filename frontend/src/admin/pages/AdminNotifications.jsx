import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import { useSiteData } from "../../hooks/useSiteData";

const typeStyles = {
  order: { bg: "bg-green-50", text: "text-green-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" /> },
  stock: { bg: "bg-amber-50", text: "text-amber-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> },
  user: { bg: "bg-blue-50", text: "text-blue-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
  product: { bg: "bg-pink-50", text: "text-pink-500", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /> },
  content: { bg: "bg-purple-50", text: "text-purple-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /> },
  email: { bg: "bg-gray-100", text: "text-gray-600", icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /> },
};

export default function AdminNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useSiteData();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AdminLayout>
      <AdminTopbar title="Notifications" subtitle="Stay on top of orders, users, and stock alerts." />

      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
          {unreadCount > 0 && (
            <button onClick={markAllNotificationsRead} className="text-xs font-semibold text-pink-500 hover:underline">
              Mark all as read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.map((n) => {
            const style = typeStyles[n.type] || typeStyles.order;
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 rounded-xl border transition-colors ${n.read ? "bg-white border-gray-100" : "bg-pink-50/30 border-pink-100"}`}
              >
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${style.bg} ${style.text}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{style.icon}</svg>
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 bg-pink-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.body}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {!n.read && (
                    <button onClick={() => markNotificationRead(n.id)} title="Mark as read" className="text-gray-400 hover:text-gray-900 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n.id)} title="Delete" className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <div className="text-center py-16 text-sm text-gray-400">You're all caught up — no notifications.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
