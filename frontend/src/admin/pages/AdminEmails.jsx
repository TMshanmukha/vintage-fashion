import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import { getCustomers } from "../../api/userApi";
import { sendBulkEmail, sendSingleEmail, getEmailLog } from "../../api/emailApi";

const MENS_TEMPLATES = [
  {
    id: "festive",
    label: "🎁 Festive Sale (25% OFF)",
    subject: "Grand Festive Sale: Flat 25% OFF on Men's Vintage Wear 🎁",
    bannerUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&auto=format&fit=crop&q=80",
    body: "Dear Gentleman,\n\nCelebrate the festive season in classic style! Enjoy Flat 25% OFF across our entire curated Men's Vintage Collection.\n\n🎟️ Use Coupon Code: MENSFESTIVE at checkout.\n\nFrom hand-tailored Cuban shirts and classic blazers to raw denim and heritage kurtas, upgrade your signature wardrobe today.\n\nLimited pieces available. Happy Shopping!",
  },
  {
    id: "flash",
    label: "⚡ 24H Flash Sale (40% OFF)",
    subject: "⚡ 24 Hours Only: Flat 40% OFF Signature Men's Fits!",
    bannerUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    body: "Hi there!\n\nFor the next 24 hours only, get Flat 40% OFF on all signature Men's vintage jackets, premium tees, and casual shirts.\n\n⚡ Coupon Code: MENFLASH40\n\nStock is strictly limited to 1-2 pieces per vintage design. Once sold out, these rare pieces won't restock.\n\nClaim your style before the timer runs out!",
  },
  {
    id: "b2g1",
    label: "🛍️ Buy 2 Get 1 Free",
    subject: "Gentleman's Special: Buy Any 2 Items & Get 1 FREE! 🛍️",
    bannerUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80",
    body: "Hello Styler,\n\nUpgrade your wardrobe for less! For a limited time, when you add any 3 Men's items to your bag, the lowest-priced item is completely FREE.\n\n🛍️ Use Code: MENSB2G1 at checkout.\n\nMix and match your favorite printed shirts, retro trousers, and heavyweight tees today!",
  },
  {
    id: "new_arrivals",
    label: "✨ New Men's Arrivals",
    subject: "The Gentleman's Drop: Discover Our New Men's Collection ✨",
    bannerUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80",
    body: "Greetings from Vintage Fashion,\n\nOur latest curated Men's drop has officially landed! Explore hand-picked vintage shirts, classic tailored blazers, retro denim, and heritage streetwear.\n\nEvery piece is hand-crafted with precision. Discover the drop now and find your signature look!",
  },
  {
    id: "ethnic",
    label: "👑 Heritage Men's Ethnic",
    subject: "Royal Men's Kurtas & Nehru Jackets Unveiled 👑",
    bannerUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
    body: "Hello Connoisseur,\n\nImmerse yourself in royal tradition with our newly unveiled Men's Heritage Ethnic catalog. Featuring handloom silk kurtas and tailored Nehru jackets made with breathable luxury fabrics.\n\nPerfect for festive celebrations, weddings, and formal occasions.\n\nExplore the collection online today!",
  },
  {
    id: "vip",
    label: "💎 VIP Reward (₹500 Off)",
    subject: "An Exclusive VIP Gift Just for You, From Vintage Fashion 💎",
    bannerUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80",
    body: "Dear VIP Patron,\n\nAs one of our most valued gentlemen, we would love to treat you to an exclusive ₹500 voucher on your next shopping journey.\n\n💎 Coupon Code: GENTLEMANVIP\n\nEnjoy complimentary express shipping and early access to limited edition drops.\n\nThank you for making Vintage Fashion your trusted style destination!",
  },
  {
    id: "cart",
    label: "🛒 Incomplete Cart Reminder",
    subject: "You left your curated styles in your shopping bag! 🛒",
    bannerUrl: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=1200&auto=format&fit=crop&q=80",
    body: "Hi there,\n\nWe noticed you left some sharp vintage pieces in your shopping bag! Because our vintage menswear inventory is rare and limited, these pieces may sell out soon.\n\nComplete your checkout today and enjoy fast, secure doorstep delivery.\n\nYour favorite styles are waiting for you!",
  },
  {
    id: "care",
    label: "💬 Styling & Sizing Support",
    subject: "Need sizing or styling recommendations for your next look? 💬",
    bannerUrl: "",
    body: "Hello,\n\nWe wanted to reach out and ensure you're having an exceptional experience on Vintage Fashion.\n\nWhether you need personal styling advice for an upcoming occasion or fit/sizing guidance on shirts or blazers, our menswear styling team is here for you.\n\nFeel free to reply directly to this email anytime — we're delighted to assist!",
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

  // Form Fields
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("compose"); // "compose" | "logs"
  const fileInputRef = useRef(null);

  const loadUsers = async () => {
    try {
      const data = await getCustomers();
      const active = (data || []).filter((u) => u.account_status === "ACTIVE" || !u.account_status);
      setUsers(active);

      if (queryUserId) {
        setSelectedUserId(queryUserId);
      } else if (active[0] && !selectedUserId) {
        setSelectedUserId(active[0].user_id);
      }
    } catch (err) {
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
            minute: "2-digit",
          }),
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadEmailLog();
  }, []);

  const handleApplyTemplate = (e) => {
    const tplId = e.target.value;
    if (!tplId) return;
    const tpl = MENS_TEMPLATES.find((t) => t.id === tplId);
    if (tpl) {
      setSubject(tpl.subject);
      setBody(tpl.body);
      if (tpl.bannerUrl) {
        setImageUrl(tpl.bannerUrl);
        setImageFile(null);
        setImagePreview(tpl.bannerUrl);
      } else {
        handleRemovePhoto();
      }
      toast.success(`Loaded template: "${tpl.label}"`);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo size should be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImageUrl("");
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
      toast.success("Photo attached successfully!");
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImageUrl("");
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      toast.error("Subject and Message body cannot be empty.");
      return;
    }

    setSending(true);
    try {
      if (recipientMode === "all") {
        const res = await sendBulkEmail({
          subject: subject.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || null,
          imageFile: imageFile || null,
        });
        toast.success(res?.message || "Email broadcast sent to all registered users!");
      } else {
        const user = users.find((u) => u.user_id === Number(selectedUserId));
        const res = await sendSingleEmail({
          userId: selectedUserId,
          subject: subject.trim(),
          body: body.trim(),
          imageUrl: imageUrl.trim() || null,
          imageFile: imageFile || null,
        });
        toast.success(res?.message || `Email sent successfully to ${user?.email || "customer"}.`);
      }

      setSubject("");
      setBody("");
      handleRemovePhoto();
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 5000);
      loadEmailLog();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  const selectedUserObj = users.find((u) => u.user_id === Number(selectedUserId));
  const activePhoto = imagePreview || imageUrl;

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Email Center"
          subtitle="Send branded announcements, promotional offers, and styling updates to customers"
        />

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Top Status Alert */}
          {sentSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm px-4 py-3 rounded-xl flex items-center gap-2.5 shadow-xs">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <span>Email delivered successfully with branded storefront link: <strong>https://vintage-fashion-xi.vercel.app</strong></span>
            </div>
          )}

          {queryEmail && recipientMode === "single" && (
            <div className="bg-pink-50 border border-pink-200 text-pink-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between">
              <div>
                <strong>Direct message to:</strong> {queryName || "User"} ({queryEmail})
              </div>
              <span className="text-[10px] bg-pink-200 text-pink-800 font-bold px-2 py-0.5 rounded-md uppercase">
                Direct
              </span>
            </div>
          )}

          {/* Navigation Bar: Compose vs Sent Logs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("compose")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "compose"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                ✉️ Compose Email
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === "logs"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                📜 Delivery History ({emailLog.length})
              </button>
            </div>

            {activeTab === "compose" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 hidden sm:inline">Template:</span>
                <select
                  onChange={handleApplyTemplate}
                  defaultValue=""
                  className="rounded-xl border border-gray-200 bg-white py-1.5 px-3 text-xs font-semibold text-gray-700 outline-none focus:border-gray-900"
                >
                  <option value="" disabled>Choose a template...</option>
                  {MENS_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {activeTab === "compose" ? (
            /* 2-Column Split: Clean Form (Left) & Realtime Inbox Mockup (Right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Section (7 cols) */}
              <form onSubmit={handleSend} className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-4.5 shadow-xs">
                {/* 1. Recipient Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2 block">
                    1. Send To
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("all")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        recipientMode === "all"
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <span>All Subscribers</span>
                        <p className={`text-[10px] font-normal mt-0.5 ${recipientMode === "all" ? "text-gray-300" : "text-gray-400"}`}>
                          Broadcast to {users.length} users
                        </p>
                      </div>
                      <span className="text-sm">{recipientMode === "all" ? "✓" : ""}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("single")}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between ${
                        recipientMode === "single"
                          ? "border-gray-900 bg-gray-900 text-white shadow-xs"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <span>Single User</span>
                        <p className={`text-[10px] font-normal mt-0.5 ${recipientMode === "single" ? "text-gray-300" : "text-gray-400"}`}>
                          Direct message
                        </p>
                      </div>
                      <span className="text-sm">{recipientMode === "single" ? "✓" : ""}</span>
                    </button>
                  </div>

                  {recipientMode === "single" && (
                    <div className="mt-3">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white"
                      >
                        {users.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name} ({u.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* 2. Subject Line */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      2. Subject Line
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{subject.length} chars</span>
                  </div>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Grand Festive Sale: Flat 25% OFF on Men's Vintage Wear 🎁"
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition"
                  />
                </div>

                {/* 3. Photo / Banner Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
                      <span>🖼️</span> 3. Photo / Banner (Optional)
                    </label>
                    {activePhoto && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] font-bold text-red-600 hover:underline"
                      >
                        Remove Photo ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="photo-upload-input"
                      />
                      <label
                        htmlFor="photo-upload-input"
                        className="cursor-pointer flex items-center gap-2 border border-gray-300 hover:border-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl px-4 py-2 text-xs font-bold text-gray-700 transition"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Choose Photo</span>
                      </label>

                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImageFile(null);
                          setImagePreview(e.target.value);
                        }}
                        className="flex-1 border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-gray-900 focus:bg-white transition"
                      />
                    </div>

                    {activePhoto && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-36 flex items-center justify-center">
                        <img
                          src={activePhoto}
                          alt="Banner Preview"
                          className="w-full h-36 object-cover"
                          onError={() => toast.error("Unable to load image. Check URL.")}
                        />
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Photo Attached
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Message Content */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      4. Message Body
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{body.length} chars</span>
                  </div>
                  <textarea
                    required
                    rows={7}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your email announcement or offer details here..."
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition leading-relaxed resize-none"
                  />
                </div>

                {/* Submit Action Button */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {recipientMode === "all" ? (
                      <>Audience: <strong>{users.length} Active Users</strong></>
                    ) : (
                      <>Recipient: <strong>{selectedUserObj?.email || "Selected Customer"}</strong></>
                    )}
                  </span>

                  <button
                    type="submit"
                    disabled={sending || (recipientMode === "single" && !selectedUserId)}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-pink-600 disabled:opacity-50 shadow-sm"
                  >
                    {sending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Email</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Realtime Live Preview (5 cols) */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4 sticky top-20">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold text-gray-700 ml-2">Live Email Preview</span>
                  </div>
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                    Customer View
                  </span>
                </div>

                {/* Email Mockup Container */}
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs text-xs">
                  {/* Header */}
                  <div className="bg-slate-900 text-white p-4 text-center">
                    <h4 className="text-sm font-black tracking-wide">
                      Vintage Fashion<span className="text-pink-500">.</span>
                    </h4>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">
                      Official Communication
                    </p>
                  </div>

                  {/* Banner Photo */}
                  {activePhoto && (
                    <div className="w-full max-h-40 overflow-hidden bg-gray-100 border-b border-gray-100">
                      <img src={activePhoto} alt="Banner" className="w-full h-40 object-cover" />
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <span className="inline-block text-[9px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md">
                      OFFICIAL UPDATE
                    </span>

                    <h5 className="text-xs font-bold text-gray-900">
                      {subject || "Subject line will appear here..."}
                    </h5>

                    <div className="text-[11px] text-gray-600 leading-relaxed bg-gray-50/80 p-3 rounded-xl border-l-2 border-pink-500 whitespace-pre-line font-normal">
                      {body || "Your message body content will appear here with rich formatting and coupon codes."}
                    </div>

                    <div className="text-center pt-2">
                      <a
                        href="https://vintage-fashion-xi.vercel.app"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-slate-900 text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-xs hover:bg-pink-600 transition-colors"
                      >
                        Visit Storefront →
                      </a>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 p-3 text-center text-[9px] text-gray-400 border-t border-gray-100 space-y-0.5">
                    <p className="font-semibold text-gray-600">Vintage Fashion Boutique</p>
                    <p>https://vintage-fashion-xi.vercel.app</p>
                    <p>© {new Date().getFullYear()} Vintage Fashion. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Sent Delivery History Table */
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">Recent Broadcasts</h3>
                <button
                  type="button"
                  onClick={loadEmailLog}
                  className="text-xs font-bold text-pink-600 hover:underline"
                >
                  Refresh Log ↻
                </button>
              </div>

              {emailLog.length === 0 ? (
                <p className="text-xs text-gray-400 py-8 text-center">No email delivery history yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        <th className="pb-3 font-semibold">Subject</th>
                        <th className="pb-3 font-semibold">Recipient</th>
                        <th className="pb-3 font-semibold">Message Preview</th>
                        <th className="pb-3 font-semibold text-right">Sent Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {emailLog.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50/70 transition-colors">
                          <td className="py-3 font-bold text-gray-900 max-w-xs truncate">{e.subject}</td>
                          <td className="py-3">
                            <span className="text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md">
                              {e.to}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 max-w-sm truncate">{e.body}</td>
                          <td className="py-3 text-right text-gray-400 text-[11px] whitespace-nowrap">{e.sentAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}