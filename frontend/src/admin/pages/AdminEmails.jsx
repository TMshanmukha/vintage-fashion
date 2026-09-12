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
    body: "Dear {name},\n\nCelebrate the festive season in classic style and supreme confidence! Our Grand Festive Sale is now live with direct discounts across our entire curated Men's Vintage Fashion collection.\n\nEnjoy Flat 25% OFF on hand-tailored Cuban shirts, classic blazers, raw selvage denim, vintage leather jackets, and heritage festive kurtas.\n\nLimited pieces per vintage design. Explore the collection today!",
  },
  {
    category: "promotions",
    label: "⚡ 24H Men's Flash Sale",
    icon: "⚡",
    subject: "⚡ 24 Hours Only: Flat 40% OFF Signature Men's Fits!",
    bannerUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80",
    body: "Hi {name}!\n\nThis is your golden window. For the next 24 hours only, enjoy direct 40% OFF discounts on all signature Men's vintage jackets, premium tees, and casual shirts.\n\nStock is strictly limited to 1-2 pieces per vintage design. Once sold out, these rare pieces won't restock.\n\nClaim your style before the timer runs out!",
  },
  {
    category: "promotions",
    label: "🛍️ Men's Buy 2 Get 1 Special",
    icon: "🛍️",
    subject: "Gentleman's Special: Buy Any 2 Items & Get 1 Free! 🛍️",
    bannerUrl: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=1200&auto=format&fit=crop&q=80",
    body: "Hello {name},\n\nUpgrade your wardrobe with timeless classics! For a limited time, explore our exclusive Buy 2 Get 1 special across our entire Men's vintage catalog.\n\nMix and match your favorite printed shirts, retro trousers, heavyweight tees, and jackets today.\n\nVisit our storefront to discover the curated styles waiting for you!",
  },
  {
    category: "launches",
    label: "✨ New Men's Vintage Arrivals",
    icon: "✨",
    subject: "The Gentleman's Drop: Discover Our New Men's Collection ✨",
    bannerUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1200&auto=format&fit=crop&q=80",
    body: "Dear {name},\n\nOur latest curated Men's collection has officially landed! Explore hand-picked vintage shirts, classic tailored blazers, retro denim, and heritage streetwear designed for timeless masculine style.\n\nEvery garment is hand-crafted with precision. Discover the drop now and find your signature look!",
  },
  {
    category: "launches",
    label: "👑 Royal Heritage Men's Ethnic Drop",
    icon: "👑",
    subject: "Royal Men's Kurtas & Nehru Jackets Unveiled 👑",
    bannerUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&auto=format&fit=crop&q=80",
    body: "Hello {name},\n\nImmerse yourself in royal tradition with our newly unveiled Men's Heritage Ethnic catalog. Featuring handloom silk kurtas, tailored Nehru jackets, and festive ensembles made with breathable luxury fabrics.\n\nPerfect for festive celebrations, weddings, and formal occasions.\n\nExplore the collection online today!",
  },
  {
    category: "vip",
    label: "💎 VIP Gentleman's Club Perks",
    icon: "💎",
    subject: "VIP Gentleman's Privilege: Early Drop Access & Priority Shipping 💎",
    bannerUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80",
    body: "Dear {name},\n\nAs one of our most valued gentlemen, we are delighted to offer you priority access to all new vintage menswear drops and complimentary express doorstep shipping.\n\nThank you for making Vintage Fashion your premier style destination. Explore the newest catalog today!",
  },
  {
    category: "customer_care",
    label: "💬 Men's Styling & Sizing Help",
    icon: "💬",
    subject: "Need sizing or styling recommendations for your next look? 💬",
    bannerUrl: "",
    body: "Hello {name},\n\nWe wanted to reach out and ensure you're having an exceptional experience on Vintage Fashion.\n\nWhether you need personal styling advice for an upcoming occasion, fit/sizing guidance on shirts or blazers, or custom recommendations, our menswear styling team is here for you.\n\nFeel free to reply directly to this email anytime — we're delighted to assist!",
  },
  {
    category: "customer_care",
    label: "🛒 Men's Bag Recovery Reminder",
    icon: "🛒",
    subject: "You left your curated styles in your shopping bag! 🛒",
    bannerUrl: "https://images.unsplash.com/photo-1550246140-5119ae4790b8?w=1200&auto=format&fit=crop&q=80",
    body: "Hi {name},\n\nWe noticed you left some sharp vintage pieces in your shopping bag! Because our vintage menswear inventory is rare and available in very limited quantities, these pieces may sell out soon.\n\nComplete your checkout today and enjoy fast, secure doorstep delivery.\n\nYour favorite styles are waiting for you!",
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

  const previewCustomerName = recipientMode === "single"
    ? (selectedUserObj?.name || "Customer Name")
    : (users[0]?.name || "Customer Name");

  const getPersonalizedPreviewText = (text) => {
    if (!text) return "";
    return text.replace(
      /\{\{\s*(name|userName|customerName|user)\s*\}\}|\{\s*(name|userName|customerName|user)\s*\}|\[(name|user\s*name|customer\s*name)\]/gi,
      previewCustomerName
    );
  };

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
                <p className="font-bold">Email Dispatched Successfully!</p>
                <p className="text-xs text-emerald-700">
                  {recipientMode === "all"
                    ? `Broadcast sent to all active customers.`
                    : `Direct message delivered.`}
                </p>
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

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Audience</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">{users.length} Users</span>
              <span className="text-[10px] text-emerald-600 font-medium">● 100% Active Subscribers</span>
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Dispatched</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">{emailLog.length} Emails</span>
              <span className="text-[10px] text-blue-600 font-medium">● Lifetime Broadcasts</span>
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Templates</span>
              <span className="text-xl font-black text-gray-900 mt-1 block">{RICH_TEMPLATES.length} Curated</span>
              <span className="text-[10px] text-purple-600 font-medium">● Men's Fashion Drops</span>
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Email Engine</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">Live &amp; Active</span>
              <span className="text-[10px] text-gray-500 font-medium">● Resend API Connected</span>
            </div>
          </div>

          {/* Preset Templates Carousel / Selector */}
          <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Curated Men's Email Templates
                </h3>
                <p className="text-xs text-gray-400">
                  Click any template to auto-populate high-converting luxury copy &amp; curated photo banner
                </p>
              </div>

              {/* Template Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedTemplateCat(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedTemplateCat === c.id
                        ? "bg-gray-900 text-white shadow-xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {filteredTemplates.map((tpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tpl)}
                  className="group relative border border-gray-200/90 rounded-2xl p-3.5 hover:border-gray-900 hover:shadow-md cursor-pointer transition-all bg-gray-50/40 hover:bg-white flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">{tpl.icon}</span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 tracking-wider">
                        {tpl.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 group-hover:text-pink-600 transition">
                      {tpl.label}
                    </h4>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {tpl.subject}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-700 group-hover:text-gray-900">
                    <span>Use Template</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main 2-Column Split: Compose Form (7 cols) + Live Preview (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Compose Form (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
              <form onSubmit={handleSend} className="space-y-5">
                {/* Recipient Mode Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    1. Select Recipient Audience
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("all")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                        recipientMode === "all"
                          ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                          : "border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-lg">📢</span>
                      <div>
                        <p className="text-xs font-bold">Broadcast to All</p>
                        <p className={`text-[10px] mt-0.5 ${recipientMode === "all" ? "text-gray-300" : "text-gray-400"}`}>
                          All active customers ({users.length})
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRecipientMode("single")}
                      className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                        recipientMode === "single"
                          ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                          : "border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="text-lg">🎯</span>
                      <div>
                        <p className="text-xs font-bold">Individual User</p>
                        <p className={`text-[10px] mt-0.5 ${recipientMode === "single" ? "text-gray-300" : "text-gray-400"}`}>
                          Select a specific patron
                        </p>
                      </div>
                    </button>
                  </div>

                  {recipientMode === "single" && (
                    <div className="mt-3">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition"
                      >
                        <option value="">-- Choose Customer --</option>
                        {users.map((u) => (
                          <option key={u.user_id} value={u.user_id}>
                            {u.name || "Customer"} — {u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Subject Line */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      2. Email Subject Line
                    </label>
                    <span className="text-[10px] text-gray-400">{subject.length} characters</span>
                  </div>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Grand Festive Sale: Flat 25% OFF on Men's Vintage Wear 🎁"
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition"
                  />
                </div>

                {/* Banner / Photo Attachment (File upload or URL) */}
                <div className="bg-gray-50/80 border border-gray-200/90 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                        <span>📷</span>
                        <span>3. Attach Photo / Banner Image (Optional)</span>
                      </label>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Upload a photo from your computer or paste an online image link
                      </p>
                    </div>

                    {activeBannerPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg transition"
                      >
                        ✕ Remove Photo
                      </button>
                    )}
                  </div>

                  {/* Dual Upload Mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option A: Direct File Upload */}
                    <div className="border border-dashed border-gray-300 rounded-xl p-3 bg-white hover:bg-gray-50 transition text-center cursor-pointer relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="space-y-1">
                        <span className="text-base">📁</span>
                        <p className="text-xs font-bold text-gray-700">
                          {imageFile ? imageFile.name : "Upload Local Image"}
                        </p>
                        <p className="text-[10px] text-gray-400">PNG, JPG, WebP up to 5MB</p>
                      </div>
                    </div>

                    {/* Option B: Direct URL Input */}
                    <div className="space-y-1">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setImageFile(null);
                          setImagePreview(e.target.value);
                        }}
                        placeholder="Or paste direct image URL (https://...)"
                        className="w-full border border-gray-200 bg-white rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:border-gray-900 transition"
                      />
                      <p className="text-[10px] text-gray-400 pl-1">e.g. Unsplash or Cloudinary link</p>
                    </div>
                  </div>

                  {/* Attached Image Preview Card */}
                  {activeBannerPreview && (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-white shadow-xs">
                      <img
                        src={activeBannerPreview}
                        alt="Email Banner Preview"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <span>✓ Photo Attached</span>
                        {imageFile && <span>({(imageFile.size / 1024).toFixed(0)} KB)</span>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      4. Message Content
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setBody(prev => (prev ? prev + " {name}" : "Dear {name},\n\n"))}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 hover:bg-pink-200 transition"
                        title="Insert dynamic customer name tag"
                      >
                        + Insert &#123;name&#125;
                      </button>
                      <span className="text-[10px] text-gray-400">{body.length} characters</span>
                    </div>
                  </div>
                  <textarea
                    required
                    rows={7}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Compose your rich email message here. Line breaks, styling, and details will be formatted luxuriously..."
                    className="w-full border border-gray-200 bg-gray-50/50 rounded-xl p-3.5 text-xs font-medium outline-none focus:border-gray-900 focus:bg-white transition leading-relaxed resize-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 flex items-center gap-1">
                    <span>💡</span>
                    <span>Use <strong className="text-pink-600 font-mono">&#123;name&#125;</strong> to automatically personalize each email with the customer's actual name.</span>
                  </p>
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
                    className="flex items-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-xs font-bold text-white transition hover:bg-pink-600 disabled:opacity-50 shadow-sm cursor-pointer"
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
                        {getPersonalizedPreviewText(subject) || "Your Subject Line Here..."}
                      </h4>

                      <div className="text-xs text-gray-600 leading-relaxed bg-gray-50/70 p-3.5 rounded-xl border-l-3 border-pink-500 whitespace-pre-line font-normal">
                        {getPersonalizedPreviewText(body) || "Your message body content will appear here with rich formatting, styling, and line breaks."}
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
                      <p className="text-[9px] text-gray-400">Personally addressed to {previewCustomerName}</p>
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