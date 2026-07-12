import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import { useSiteData } from "../../hooks/useSiteData";

export default function AdminEmails() {
  const { users, emailLog, sendEmail, addNotification } = useSiteData();
  const [recipientMode, setRecipientMode] = useState("all");
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (recipientMode === "all") {
      sendEmail({ to: `All users (${users.length})`, subject, body });
      addNotification({ title: "Bulk email sent", body: `Sent "${subject}" to ${users.length} users`, type: "email" });
    } else {
      const user = users.find((u) => u.id === Number(selectedUserId));
      sendEmail({ to: user?.email, subject, body });
      addNotification({ title: "Email sent", body: `Sent "${subject}" to ${user?.email}`, type: "email" });
    }
    setSubject("");
    setBody("");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <AdminLayout>
      <AdminTopbar title="Email Center" subtitle="Send announcements, offers, or direct messages to your users." />

      <div className="p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Compose */}
        <div className="lg:col-span-3">
          {sent && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg mb-6">
              ✓ Email sent successfully.
            </div>
          )}
          <form onSubmit={handleSend} className="bg-white border border-gray-100 rounded-xl p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">Recipients</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRecipientMode("all")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg border transition-colors ${recipientMode === "all" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-900"}`}
                >
                  All Users ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("single")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-2.5 rounded-lg border transition-colors ${recipientMode === "single" ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-900"}`}
                >
                  Single User
                </button>
              </div>
              {recipientMode === "single" && (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 bg-white mt-3"
                >
                  {users.map((u) => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Subject</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. New Summer Collection is Here"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Message</label>
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your message..."
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors resize-none"
              />
            </div>

            <button type="submit" className="bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-lg hover:bg-pink-500 transition-colors">
              Send Email
            </button>
          </form>
        </div>

        {/* Sent log */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Sent History</h2>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {emailLog.length === 0 && (
              <p className="text-sm text-gray-400">No emails sent yet.</p>
            )}
            {emailLog.map((e) => (
              <div key={e.id} className="bg-white border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-800 truncate">{e.subject}</p>
                  <span className="text-xs text-gray-300 flex-shrink-0 ml-2">{e.sentAt}</span>
                </div>
                <p className="text-xs text-gray-400 mb-1">To: {e.to}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
