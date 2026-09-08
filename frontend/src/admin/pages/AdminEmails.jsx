import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import { getCustomers } from "../../api/userApi";
import { sendBulkEmail, sendSingleEmail, getEmailLog } from "../../api/emailApi";

const QUICK_TEMPLATES = [
  {
    label: "🎁 10% Discount Gift",
    subject: "A Special 10% Discount Just for You! 🎁",
    body: "Hi there!\n\nAs a valued member of Vintage Fashion, we'd love to treat you to an exclusive 10% discount on your next purchase.\n\nUse code: VINTAGE10 at checkout to claim your offer.\n\nExplore our latest vintage collection today!"
  },
  {
    label: "✨ New Collection Launch",
    subject: "Discover Our New Vintage Collection ✨",
    body: "Hello!\n\nOur latest seasonal collection has just dropped! Explore newly curated vintage apparel, hand-crafted fabrics, and timeless statement pieces designed for everyday elegance.\n\nCheck them out now before stocks run out."
  },
  {
    label: "💬 Customer Support Check-in",
    subject: "How can we help with your Vintage Fashion experience?",
    body: "Hello,\n\nWe wanted to reach out and make sure everything is going smoothly with your recent browsing and shopping experience on Vintage Fashion.\n\nIf you have any questions, feedback, or need styling recommendations, feel free to reply directly to this message."
  },
];

export default function AdminEmails() {
  const [searchParams] = useSearchParams();
  const queryUserId = searchParams.get("userId");
  const queryName = searchParams.get("name");
  const queryEmail = searchParams.get("email");

  const [users, setUsers] = useState([]);
  const [emailLog, setEmailLog] = useState([]);
  const [recipientMode, setRecipientMode] = useState(queryUserId ? "single" : "all");
  const [selectedUserId, setSelectedUserId] = useState(queryUserId || "");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const loadUsers = async () => {
    try {
      const data = await getCustomers();
      const active = (data || []).filter((u) => u.account_status === "ACTIVE");
      setUsers(active);

      if (queryUserId) {
        setSelectedUserId(queryUserId);
      } else if (active[0] && !selectedUserId) {
        setSelectedUserId(active[0].user_id);
      }
    } catch (err) {
      toast.error("Failed to load users.");
      console.error(err);
    }
  };

  const loadEmailLog = async () => {
    try {
      const data = await getEmailLog();
      setEmailLog(
        (data || []).map((e) => ({
          id: e.email_id,
          to: e.recipient_type === "all" ? (e.recipient_label || "All Users") : e.recipient_email,
          subject: e.subject,
          body: e.body,
          sentAt: new Date(e.sent_at).toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          })
        }))
      );
    } catch (err) {
      toast.error("Failed to load email history.");
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadEmailLog();
  }, []);

  const handleApplyTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
    toast.success("Template applied!");
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      if (recipientMode === "all") {
        const res = await sendBulkEmail({ subject, body });
        toast.success(res?.message || "Email broadcast sent to all users.");
      } else {
        const user = users.find((u) => u.user_id === Number(selectedUserId));
        const res = await sendSingleEmail({ userId: selectedUserId, subject, body });
        toast.success(res?.message || `Email sent successfully to ${user?.email || "user"}.`);
      }
      setSubject("");
      setBody("");
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      loadEmailLog();
    } catch (err) {
      toast.error("Failed to send email.");
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const selectedUserObj = users.find((u) => u.user_id === Number(selectedUserId));

  return (
    <AdminLayout>
      <AdminTopbar title="Email Center" subtitle="Send rich announcements, promotional offers, or direct messages to customers." />

      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        {/* Compose */}
        <div className="lg:col-span-3">
          {sent && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2 shadow-sm">
              <span className="text-emerald-500 font-bold">✓</span> Email delivered successfully with branded storefront formatting!
            </div>
          )}

          {queryEmail && recipientMode === "single" && (
            <div className="bg-pink-50 border border-pink-200 text-pink-900 text-xs sm:text-sm px-4 py-3 rounded-xl mb-6 flex items-center justify-between shadow-sm">
              <div>
                <strong>Direct Message to:</strong> {queryName || "User"} ({queryEmail})
              </div>
              <span className="text-[11px] bg-pink-200 text-pink-800 font-bold px-2 py-0.5 rounded-md uppercase">Direct</span>
            </div>
          )}

          <form onSubmit={handleSend} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                Target Audience
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRecipientMode("all")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-xl border transition-all ${
                    recipientMode === "all"
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-900"
                  }`}
                >
                  All Users / Subscribers ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode("single")}
                  className={`flex-1 text-xs font-bold uppercase tracking-widest py-3 rounded-xl border transition-all ${
                    recipientMode === "single"
                      ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-gray-900"
                  }`}
                >
                  Single Customer
                </button>
              </div>

              {recipientMode === "single" && (
                <div className="mt-3">
                  <label className="text-[11px] text-gray-500 font-medium mb-1 block">Select Customer</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 bg-white"
                  >
                    {users.map((u) => (
                      <option key={u.user_id} value={u.user_id}>
                        {u.name} — {u.email} ({u.orders_count || 0} orders)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {recipientMode === "all" && (
                <p className="text-xs text-gray-400 mt-2">
                  Broadcasts will be sent to all {users.length} active registered users and newsletter subscribers.
                </p>
              )}
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2 block">
                Quick Fill Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="text-xs font-medium bg-gray-50 hover:bg-pink-50 hover:text-pink-600 border border-gray-200 hover:border-pink-200 rounded-lg px-3 py-1.5 transition-colors"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Subject Line</label>
              <input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Exclusive Update from Vintage Fashion"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-1.5 block">Message Body</label>
              <textarea
                required
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your email message here. It will be sent inside our luxurious Vintage Fashion HTML email template..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={sending || (recipientMode === "single" && !selectedUserId)}
              className="w-full sm:w-auto bg-gray-900 text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-pink-500 transition-all disabled:opacity-50 shadow-sm"
            >
              {sending ? "Sending..." : "Send Branded Email →"}
            </button>
          </form>
        </div>

        {/* Sent log */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-900">Email Delivery Log</h2>
            <span className="text-xs text-gray-400">{emailLog.length} sent</span>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {emailLog.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center text-sm text-gray-400">
                No emails sent yet.
              </div>
            )}
            {emailLog.map((e) => (
              <div key={e.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:border-gray-200 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-bold text-gray-900 line-clamp-1">{e.subject}</p>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">{e.sentAt}</span>
                </div>
                <p className="text-xs text-pink-600 font-semibold mb-1">To: {e.to}</p>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{e.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}