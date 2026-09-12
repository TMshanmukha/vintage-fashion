import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import toast from "react-hot-toast";
import { getCustomers } from "../../api/userApi";
import { sendBulkEmail, sendSingleEmail, getEmailLog } from "../../api/emailApi";

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All Templates" },
  { id: "promotions", label: "🎁 Sales & Offers" },
  { id: "launches", label: "✨ New Collections" },
  { id: "vip", label: "👑 VIP & Rewards" },
  { id: "customer_care", label: "💬 Customer Care" },
];

const RICH_TEMPLATES = [
  {
    category: "promotions",
    label: "Men's Festive Sale (25% OFF)",
    icon: "🎁",
    subject: "Grand Festive Sale: Flat 25% OFF on Men's Vintage Wear 🎁",
    bannerUrl: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=1200&auto=format&fit=crop&q=80",
    body: "Dear Gentleman,\n\nCelebrate the festive season in classic style and supreme confidence! Our Grand Festive Sale is now live with direct discounts across our entire curated Men's Vintage Fashion collection.\n\nEnjoy Flat 25% OFF on hand-tailored Cuban shirts, classic blazers, raw selvage denim, vintage leather jackets, and heritage festive kurtas.\n\nLimited pieces per vintage design. Explore the collection today!",
  },
  {
    category: "promotions",
    label: "⚡ 24H Men's Flash Sale",
    icon: "⚡",
    subject: "⚡ 24 Hours Only: Flat 40% OFF Signature Men's Fits!",
    bannerUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    body: "Hi there!\n\nThis is your golden window. For the next 24 hours only, enjoy direct 40% OFF discounts on all signature Men's vintage jackets, premium tees, and casual shirts.\n\nStock is strictly limited to 1-2 pieces per vintage design. Once sold out, these rare pieces won't restock.\n\nClaim your style before the timer runs out!",
  },
  {
    category: "promotions",
    label: "🛍️ Men's Buy 2 Get 1 Special",
    icon: "🛍️",
    subject: "Gentleman's Special: Buy Any 2 Items & Get 1 Free! 🛍️",
    bannerUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80",
    body: "Hello Styler,\n\nUpgrade your wardrobe with timeless classics! For a limited time, explore our exclusive Buy 2 Get 1 special across our entire Men's vintage catalog.\n\nMix and match your favorite printed shirts, retro trousers, heavyweight tees, and jackets today.\n\nVisit our storefront to discover the curated styles waiting for you!",
  },
  {
    category: "launches",
    label: "✨ New Men's Vintage Arrivals",
    icon: "✨",
    subject: "The Gentleman's Drop: Discover Our New Men's Collection ✨",
    bannerUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80",
    body: "Greetings from Vintage Fashion,\n\nOur latest curated Men's collection has officially landed! Explore hand-picked vintage shirts, classic tailored blazers, retro denim, and heritage streetwear designed for timeless masculine style.\n\nEvery garment is hand-crafted with precision. Discover the drop now and find your signature look!",
  },
  {
    category: "launches",
    label: "👑 Royal Heritage Men's Ethnic Drop",
    icon: "👑",
    subject: "Royal Men's Kurtas & Nehru Jackets Unveiled 👑",
    bannerUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
    body: "Hello Connoisseur,\n\nImmerse yourself in royal tradition with our newly unveiled Men's Heritage Ethnic catalog. Featuring handloom silk kurtas, tailored Nehru jackets, and festive ensembles made with breathable luxury fabrics.\n\nPerfect for festive celebrations, weddings, and formal occasions.\n\nExplore the collection online today!",
  },
  {
    category: "vip",
    label: "💎 VIP Gentleman's Club Perks",
    icon: "💎",
    subject: "VIP Gentleman's Privilege: Early Drop Access & Priority Shipping 💎",
    bannerUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80",
    body: "Dear VIP Patron,\n\nAs one of our most valued gentlemen, we are delighted to offer you priority access to all new vintage menswear drops and complimentary express doorstep shipping.\n\nThank you for making Vintage Fashion your premier style destination. Explore the newest catalog today!",
  },
  {
    category: "customer_care",
    label: "💬 Men's Styling & Sizing Help",
    icon: "💬",
    subject: "Need sizing or styling recommendations for your next look? 💬",
    bannerUrl: "",
    body: "Hello,\n\nWe wanted to reach out and ensure you're having an exceptional experience on Vintage Fashion.\n\nWhether you need personal styling advice for an upcoming occasion, fit/sizing guidance on shirts or blazers, or custom recommendations, our menswear styling team is here for you.\n\nFeel free to reply directly to this email anytime — we're delighted to assist!",
  },
  {
    category: "customer_care",
    label: "🛒 Men's Bag Recovery Reminder",
    icon: "🛒",
    subject: "You left your curated styles in your shopping bag! 🛒",
    bannerUrl: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=1200&auto=format&fit=crop&q=80",
    body: "Hi there,\n\nWe noticed you left some sharp vintage pieces in your shopping bag! Because our vintage menswear inventory is rare and available in very limited quantities, these pieces may sell out soon.\n\nComplete your checkout today and enjoy fast, secure doorstep delivery.\n\nYour favorite styles are waiting for you!",
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
  const [selectedTemplateCat, setSelectedTemplateCat] = useState("all");

  // Form State
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [previewTab, setPreviewTab] = useState("compose"); // "compose" | "preview"
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
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
      toast.error("Failed to load users list.");
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
    if (tpl.bannerUrl) {
      setImageUrl(tpl.bannerUrl);
      setImageFile(null);
      setImagePreview(tpl.bannerUrl);
    }
    toast.success(`Applied template: "${tpl.label}"`);
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image file size should be less than 5MB.");
        return;
      }
      setImageFile(file);
      setImageUrl("");
      const localUrl = URL.createObjectURL(file);
      setImagePreview(localUrl);
      toast.success("Photo attached!");
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
      toast.error("Subject and Message body are required.");
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
        toast.success(res?.message || "Email broadcast sent successfully to all users!");
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
      setSent(true);
      setTimeout(() => setSent(false), 5000);
      loadEmailLog();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to deliver email.");
    } finally {
      setSending(false);
    }
  };

  const filteredTemplates = RICH_TEMPLATES.filter(
    (t) => selectedTemplateCat === "all" || t.category === selectedTemplateCat
  );

  const selectedUserObj = users.find((u) => u.user_id === Number(selectedUserId));
  const activeBannerPreview = imagePreview || imageUrl;

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Email Center & Campaigns"
          subtitle="Design rich promotional emails, announce collections, attach photos, and broadcast to customers"
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          {sent && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm px-4 py-3.5 rounded-2xl flex items-center gap-3 shadow-xs">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs">
                ✓
              </span>
              <div>
                <strong>Email Broadcast Dispatched!</strong> Delivered with high-converting branded luxury styling and attachments.
              </div>
            </div>
          )}

          {queryEmail && recipientMode === "single" && (
            <div className="bg-pink-50 border border-pink-200 text-pink-900 text-xs sm:text-sm px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <strong>Direct Customer Message to:</strong> {queryName || "User"} ({queryEmail})
              </div>
              <span className="text-[10px] bg-pink-200 text-pink-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                Direct
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Email Composer & Templates (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Ready-to-Use Templates Library */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <span>✨</span> Ready-to-Use Email Templates
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Click any template to auto-fill subject, banner photo & copy
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-full">
                    {filteredTemplates.length} Templates
                  </span>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedTemplateCat(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        selectedTemplateCat === cat.id
                          ? "bg-gray-900 text-white shadow-xs"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Templates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {filteredTemplates.map((tpl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="text-left p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-pink-50/40 hover:border-pink-300 hover:shadow-xs transition-all group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tpl.icon}</span>
                          <span className="text-xs font-bold text-gray-900 group-hover:text-pink-600 transition-colors truncate">
                            {tpl.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 font-medium">{tpl.subject}</p>
                      </div>
                      <span className="text-[10px] font-bold text-pink-600 mt-2 flex items-center gap-1 group-hover:underline">
                        Apply Template →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compose Card */}
              <form onSubmit={handleSend} className="bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
                {/* Mode Selector */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 block">
                    1. Target Audience
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("all")}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                        recipientMode === "all"
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span>Broadcast to All Users</span>
                      <span className="text-[10px] font-normal opacity-80 mt-0.5">
                        {users.length} Active Subscribers
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("single")}
                      className={`py-3 px-4 rounded-xl border text-xs font-bold flex flex-col items-center justify-center transition-all ${
                        recipientMode === "single"
                          ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      <span>Direct Single Customer</span>
                      <span className="text-[10px] font-normal opacity-80 mt-0.5">
                        Specific recipient
                      </span>
                    </button>
                  </div>

                  {recipientMode === "single" && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Choose Customer</label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition"
                      >
                        {users.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name} — {u.email} ({u.orders_count || 0} orders)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      2. Subject Line
                    </label>
                    <span className="text-[10px] text-gray-400">{subject.length} chars</span>
                  </div>
                  <input
                    required
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Exclusive Festive Collection & 25% Off 🎁"
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-4 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition"
                  />
                </div>

                {/* Photo / Banner Attachment */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <span>🖼️</span> 3. Email Photo / Banner (Optional)
                    </label>
                    {activeBannerPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700"
                      >
                        Remove Photo ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="email-photo-upload"
                      />
                      <label
                        htmlFor="email-photo-upload"
                        className="flex-1 cursor-pointer flex items-center justify-center gap-2 border border-dashed border-gray-300 hover:border-gray-900 bg-gray-50/70 hover:bg-gray-100 rounded-xl py-2.5 px-4 text-xs font-bold text-gray-700 transition"
                      >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Upload Photo File
                      </label>

                      <div className="relative flex-1">
                        <input
                          type="url"
                          placeholder="Or paste image URL..."
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setImageFile(null);
                            setImagePreview(e.target.value);
                          }}
                          className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-gray-900 focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {activeBannerPreview && (
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 max-h-44 flex items-center justify-center shadow-xs">
                        <img
                          src={activeBannerPreview}
                          alt="Email banner preview"
                          className="w-full h-44 object-cover"
                          onError={() => {
                            toast.error("Image failed to load. Check URL.");
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-xs">
                          Banner Attached
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      4. Message Content
                    </label>
                    <span className="text-[10px] text-gray-400">{body.length} characters</span>
                  </div>
                  <textarea
                    required
                    rows={7}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Compose your rich email message here. Line breaks, styling, and details will be formatted luxuriously..."
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition leading-relaxed resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 font-medium">
                    {recipientMode === "all" ? (
                      <span>Sending to <strong>{users.length}</strong> active subscribers</span>
                    ) : (
                      <span>Sending to <strong>{selectedUserObj?.email || "selected user"}</strong></span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sending || (recipientMode === "single" && !selectedUserId)}
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-pink-600 disabled:opacity-50 shadow-sm"
                  >
                    {sending ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Broadcast...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Send Branded Email →</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live Preview & Delivery History (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tab Selector */}
              <div className="bg-white border border-gray-200/80 rounded-2xl p-1.5 flex items-center shadow-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab("compose")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    previewTab === "compose"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  👁️ Live Inbox Preview
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("history")}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                    previewTab === "history"
                      ? "bg-gray-900 text-white shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  📜 Delivery Log ({emailLog.length})
                </button>
              </div>

              {previewTab === "compose" ? (
                /* Real-Time Luxury Email Inbox Preview Mockup */
                <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="w-3 h-3 rounded-full bg-amber-400" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                      <span className="text-[11px] font-bold text-gray-400 ml-2">Inbox Preview</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                      Brand Mockup
                    </span>
                  </div>

                  {/* Rendered Email Container */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-5 text-center">
                      <h3 className="text-base font-black tracking-wide">
                        Vintage Fashion<span className="text-pink-500">.</span>
                      </h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                        Official Communication
                      </p>
                    </div>

                    {/* Banner Image */}
                    {activeBannerPreview && (
                      <div className="w-full max-h-48 overflow-hidden bg-gray-100 border-b border-gray-100">
                        <img
                          src={activeBannerPreview}
                          alt="Banner Preview"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="p-5 space-y-3">
                      <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-pink-600 bg-pink-50 border border-pink-200 px-2 py-0.5 rounded-md">
                        OFFICIAL UPDATE
                      </span>

                      <h4 className="text-sm font-bold text-gray-900">
                        {subject || "Your Subject Line Here..."}
                      </h4>

                      <div className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border-l-3 border-pink-500 whitespace-pre-line font-normal">
                        {body || "Your message body content will appear here with rich formatting, styling, and line breaks."}
                      </div>

                      <div className="text-center pt-2">
                        <div className="inline-block bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-xs">
                          Visit Storefront →
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 p-4 text-center text-[10px] text-gray-400 border-t border-gray-100 space-y-1">
                      <p className="font-semibold text-gray-600">Vintage Fashion Boutique</p>
                      <p>© {new Date().getFullYear()} Vintage Fashion. All Rights Reserved.</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Delivery History Log */
                <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Recent Broadcasts</h3>
                    <button
                      type="button"
                      onClick={loadEmailLog}
                      className="text-[11px] font-bold text-pink-600 hover:underline"
                    >
                      Refresh Log ↻
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1">
                    {emailLog.length === 0 ? (
                      <div className="text-center py-12 text-xs text-gray-400">
                        No broadcast history yet. Send your first campaign!
                      </div>
                    ) : (
                      emailLog.map((e) => (
                        <div
                          key={e.id}
                          className="bg-gray-50/60 border border-gray-200/80 rounded-xl p-3.5 hover:bg-white hover:border-gray-300 transition-all shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{e.subject}</p>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{e.sentAt}</span>
                          </div>
                          <span className="inline-block text-[10px] font-bold text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded mb-1.5">
                            To: {e.to}
                          </span>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{e.body}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}