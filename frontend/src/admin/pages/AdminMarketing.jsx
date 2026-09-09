import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ProductPickerBox from "../components/marketing/ProductPickerBox";
import CardFormModal from "../components/marketing/Cardformmodal";
import * as siteSettingsApi from "../../api/siteSettingsApi";
import * as bannerApi from "../../api/bannerApi";
import * as cardApi from "../../api/promotionalCardApi";
import * as categoryApi from "../../api/categoryApi";
import * as featuredApi from "../../api/featuredProductApi";
import * as flashSaleApi from "../../api/flashSaleApi";
import * as sectionApi from "../../api/homepageSectionApi";
import * as productPickerApi from "../../api/ProductPickerApi";
import { useEffect, useMemo, useState } from "react";

export default function AdminMarketing() {
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ============== ANNOUNCEMENT BAR ============== */
  const [settings, setSettings] = useState({
    announcement_text: "",
    announcement_enabled: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  /* ============== HERO BANNER ============== */
  const [banners, setBanners] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    button_text: "",
    button_link: "/shop",
    discount_percent: "",
    status: "ACTIVE",
  });
  const [desktopImageFile, setDesktopImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const activeBanner = banners[0];
  const [showBannerProductPicker, setShowBannerProductPicker] = useState(false);

  const desktopPreviewSrc = useMemo(() => {
    if (desktopImageFile) return URL.createObjectURL(desktopImageFile);
    return activeBanner?.desktop_image_url || null;
  }, [desktopImageFile, activeBanner?.desktop_image_url]);

  useEffect(() => {
    return () => {
      if (desktopImageFile && desktopPreviewSrc) {
        URL.revokeObjectURL(desktopPreviewSrc);
      }
    };
  }, [desktopPreviewSrc, desktopImageFile]);

  /* ============== PROMOTIONAL CARDS ============== */
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openCardPicker, setOpenCardPicker] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);

  /* ============== FEATURED PRODUCTS ============== */
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showProductPicker, setShowProductPicker] = useState(false);

  /* ============== FLASH SALE ============== */
  const [flashSales, setFlashSales] = useState([]);
  const [flashForm, setFlashForm] = useState({
    title: "",
    description: "",
    discount_value: "",
    badge: "",
    button_text: "Shop Now",
    button_link: "/shop",
    start_date: "",
    end_date: "",
  });

  const [flashImageFile, setFlashImageFile] = useState(null);
  const [savingFlashSale, setSavingFlashSale] = useState(false);
  const activeFlashSale = flashSales[0];
  const [showFlashProductPicker, setShowFlashProductPicker] = useState(false);

  /* ============== HOMEPAGE SECTIONS ============== */
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ==========================================================
     LOAD EVERYTHING ON MOUNT
  ========================================================== */
  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      await Promise.all([
        loadSettings(),
        loadBanners(),
        loadCards(),
        loadCategories(),
        loadFeatured(),
        loadFlashSales(),
        loadSections(),
        loadProducts(),
      ]);
    } catch (err) {
      console.error("Failed to load marketing data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    const res = await siteSettingsApi.getSiteSettings();
    if (res.data?.data) {
      setSettings({
        announcement_text: res.data.data.announcement_text || "",
        announcement_enabled: !!res.data.data.announcement_enabled,
      });
    }
  }

  async function loadBanners() {
    const res = await bannerApi.getBanners();
    setBanners(res.data?.data || []);
    if (res.data?.data?.[0]) {
      const b = res.data.data[0];
      setBannerForm({
        title: b.title || "",
        subtitle: b.subtitle || "",
        description: b.description || "",
        button_text: b.button_text || "",
        button_link: b.button_link || "/shop",
        discount_percent: b.discount_percent ?? "",
        status: b.status || "ACTIVE",
      });
    }
  }

  async function loadCards() {
    const res = await cardApi.getCards();
    setCards(res.data?.data || []);
  }

  async function loadCategories() {
    try {
      const res = await categoryApi.getCategories();
      const categoryList = Array.isArray(res?.data) ? res.data : [];
      setCategories(
        categoryList.filter(
          (category) =>
            category.is_active === true ||
            category.is_active === 1 ||
            category.is_active === "1"
        )
      );
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }

  async function loadFeatured() {
    const res = await featuredApi.getFeaturedProducts();
    setFeatured(res.data?.data || []);
  }

  async function loadFlashSales() {
    const res = await flashSaleApi.getFlashSales();
    setFlashSales(res.data?.data || []);
    if (res.data?.data?.[0]) {
      const f = res.data.data[0];
      setFlashForm({
        title: f.title || "",
        description: f.description || "",
        discount_value: f.discount_value || "",
        badge: f.badge || "",
        button_text: f.button_text || "Shop Now",
        button_link: f.button_link || "/shop",
        start_date: f.start_date?.slice(0, 16) || "",
        end_date: f.end_date?.slice(0, 16) || "",
      });
    }
  }

  async function loadSections() {
    const res = await sectionApi.getSections();
    setSections(res.data?.data || []);
  }

  async function loadProducts() {
    try {
      const res = await productPickerApi.getProductsForPicker();
      const payload = res.data?.data ?? res.data;
      const list = payload?.products ?? payload ?? [];
      setAllProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Could not load products for picker:", err);
      showToast("Could not load products list.", "error");
    }
  }

  /* ==========================================================
     ANNOUNCEMENT BAR
  ========================================================== */
  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      await siteSettingsApi.updateSiteSettings(settings);
      showToast("Announcement bar saved.");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showToast(
        err?.response?.data?.message || "Could not save announcement bar settings.",
        "error"
      );
    } finally {
      setSavingSettings(false);
    }
  }

  /* ==========================================================
     HERO BANNER
  ========================================================== */
  async function handleSaveBanner() {
    setSavingBanner(true);
    try {
      const formData = new FormData();
      Object.entries(bannerForm).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      if (desktopImageFile) formData.append("desktop_image", desktopImageFile);
      if (mobileImageFile) formData.append("mobile_image", mobileImageFile);
      if (!activeBanner) formData.append("display_order", 1);
      if (!formData.get("button_link")) formData.set("button_link", "/shop");

      if (activeBanner) {
        await bannerApi.updateBanner(activeBanner.banner_id, formData);
      } else {
        await bannerApi.createBanner(formData);
      }
      await loadBanners();
      setDesktopImageFile(null);
      setMobileImageFile(null);
      showToast("Hero banner saved.");
    } catch (err) {
      console.error("Failed to save banner:", err);
      showToast(
        err?.response?.data?.message || "Could not save the hero banner.",
        "error"
      );
    } finally {
      setSavingBanner(false);
    }
  }

  function handleBannerDiscountChange(value) {
    setBannerForm((f) => ({
      ...f,
      discount_percent: value,
      button_link:
        value && Number(value) > 0 && activeBanner
          ? `/offer/banner/${activeBanner.banner_id}`
          : f.button_link,
    }));
  }

  async function handleToggleBannerProduct(product) {
    if (!activeBanner) {
      showToast("Save the banner first.", "error");
      return;
    }

    const alreadySelected =
      activeBanner.products?.some((p) => p.product_id === product.product_id) || false;

    const nextIds = alreadySelected
      ? activeBanner.products
          .filter((p) => p.product_id !== product.product_id)
          .map((p) => p.product_id)
      : [
          ...(activeBanner.products || []).map((p) => p.product_id),
          product.product_id,
        ];

    try {
      const response = await bannerApi.setBannerProducts(activeBanner.banner_id, nextIds);
      const updatedBanner = response.data?.data;
      if (updatedBanner) {
        setBanners((current) =>
          current.map((banner) =>
            banner.banner_id === updatedBanner.banner_id ? updatedBanner : banner
          )
        );
      }
      showToast("Banner products updated.");
    } catch (err) {
      console.error("Failed to update banner products:", err?.response || err);
      showToast(
        err?.response?.data?.message || "Could not update banner products.",
        "error"
      );
    }
  }

  /* ==========================================================
     PROMOTIONAL CARDS
  ========================================================== */
  async function handleCreateCard(formData) {
    formData.set("display_order", cards.length + 1);
    if (!formData.get("button_link")) {
      formData.set("button_link", "/shop");
    }
    await cardApi.createCard(formData);
    await loadCards();
    showToast("Promotional card added.");
  }

  async function handleUpdateCard(cardId, fields) {
    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });
      await cardApi.updateCard(cardId, formData);
      await loadCards();
      showToast("Card updated.");
    } catch (err) {
      console.error("Failed to update card:", err);
      showToast("Could not update card.", "error");
    }
  }

  function handleCardDiscountBlur(card, value) {
    const updates = { discount_percent: value === "" ? "" : value };
    if (card.category_id) {
      const params = new URLSearchParams({ category: String(card.category_id) });
      if (value && Number(value) > 0) params.set("discount", value);
      updates.button_link = `/shop?${params.toString()}`;
    } else if (value && Number(value) > 0) {
      updates.button_link = `/offer/card/${card.card_id}`;
    } else {
      updates.button_link = "/shop";
    }
    handleUpdateCard(card.card_id, updates);
  }

  function handleCardCategoryChange(card, categoryId) {
    const updates = { category_id: categoryId === "" ? "" : categoryId };
    if (categoryId) {
      const params = new URLSearchParams({ category: categoryId });
      if (card.discount_percent && Number(card.discount_percent) > 0) {
        params.set("discount", String(card.discount_percent));
      }
      updates.button_link = `/shop?${params.toString()}`;
    } else {
      updates.button_link =
        card.discount_percent > 0 ? `/offer/card/${card.card_id}` : "/shop";
    }
    handleUpdateCard(card.card_id, updates);
  }

  async function handleDeleteCard(cardId) {
    try {
      await cardApi.deleteCard(cardId);
      setCards((prev) => prev.filter((c) => c.card_id !== cardId));
      showToast("Card deleted.");
    } catch (err) {
      console.error("Failed to delete card:", err);
      showToast("Could not delete card.", "error");
    }
  }

  async function handleToggleCardProduct(card, product) {
    const alreadySelected =
      card.products?.some((p) => p.product_id === product.product_id) || false;

    const nextIds = alreadySelected
      ? card.products
          .filter((p) => p.product_id !== product.product_id)
          .map((p) => p.product_id)
      : [...(card.products || []).map((p) => p.product_id), product.product_id];

    try {
      const response = await cardApi.setCardProducts(card.card_id, nextIds);
      const updatedCard = response.data?.data;
      if (updatedCard) {
        setCards((current) =>
          current.map((currentCard) =>
            currentCard.card_id === updatedCard.card_id ? updatedCard : currentCard
          )
        );
      }
      showToast("Card products updated.");
    } catch (err) {
      console.error("Failed to update card products:", err?.response || err);
      showToast(
        err?.response?.data?.message || "Could not update card products.",
        "error"
      );
    }
  }

  /* ==========================================================
     FEATURED PRODUCTS
  ========================================================== */
  async function handleToggleFeatured(product) {
    const alreadyFeatured = featured.some((f) => f.product_id === product.product_id);
    const nextIds = alreadyFeatured
      ? featured.filter((f) => f.product_id !== product.product_id).map((f) => f.product_id)
      : [...featured.map((f) => f.product_id), product.product_id];

    try {
      const res = await featuredApi.setFeaturedProducts(nextIds);
      setFeatured(res.data?.data || []);
      showToast("Featured products updated.");
    } catch (err) {
      console.error("Failed to update featured products:", err);
      showToast("Could not update featured products.", "error");
    }
  }

  async function handleRemoveFeatured(featuredId) {
    try {
      const res = await featuredApi.removeFeaturedProduct(featuredId);
      setFeatured(res.data?.data || []);
      showToast("Product removed from featured.");
    } catch (err) {
      console.error("Failed to remove featured product:", err);
      showToast("Could not remove featured product.", "error");
    }
  }

  /* ==========================================================
     FLASH SALE
  ========================================================== */
  async function handleSaveFlashSale() {
    setSavingFlashSale(true);
    try {
      const payload = {
        ...flashForm,
        discount_type: "PERCENTAGE",
        discount_value: Number(flashForm.discount_value),
        start_date: flashForm.start_date,
        end_date: flashForm.end_date,
      };

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value);
      });

      if (flashImageFile) {
        formData.append("banner_image", flashImageFile);
      }

      if (activeFlashSale) {
        await flashSaleApi.updateFlashSale(activeFlashSale.flash_sale_id, formData);
      } else {
        await flashSaleApi.createFlashSale(formData);
      }
      await loadFlashSales();
      showToast("Flash sale saved.");
    } catch (err) {
      console.error("Failed to save flash sale:", err);
      showToast(
        err?.response?.data?.message ||
          "Could not save flash sale. Check discount/date fields.",
        "error"
      );
    } finally {
      setSavingFlashSale(false);
    }
  }

  async function handleToggleFlashProduct(product) {
    if (!activeFlashSale) {
      showToast("Create the flash sale first.", "error");
      return;
    }

    const alreadySelected =
      activeFlashSale.products?.some((p) => p.product_id === product.product_id) ||
      false;

    const nextIds = alreadySelected
      ? activeFlashSale.products
          .filter((p) => p.product_id !== product.product_id)
          .map((p) => p.product_id)
      : [
          ...(activeFlashSale.products || []).map((p) => p.product_id),
          product.product_id,
        ];

    try {
      const response = await flashSaleApi.setFlashSaleProducts(
        activeFlashSale.flash_sale_id,
        nextIds
      );
      const updatedSale = response.data?.data;
      if (updatedSale) {
        setFlashSales((current) =>
          current.map((sale) =>
            sale.flash_sale_id === updatedSale.flash_sale_id ? updatedSale : sale
          )
        );
      }
      showToast("Flash sale products updated.");
    } catch (err) {
      console.error(err);
      showToast("Could not update flash sale products.", "error");
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <AdminTopbar title="Marketing & Homepage" subtitle="Loading..." />
        <div className="p-4 sm:p-6 lg:p-8 text-center text-gray-500">Loading marketing data…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminTopbar
        title="Marketing & Homepage"
        subtitle="Manage homepage banners, promotions, featured products, and storefront marketing."
      />

      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">

          {/* Announcement Bar */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">📢 Announcement Bar</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Display promotional messages at the top of every page.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.announcement_enabled}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, announcement_enabled: e.target.checked }))
                  }
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-500 relative after:absolute after:left-1 after:top-1 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Announcement Text
                </label>
                <input
                  className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                  placeholder="Free Shipping on orders above ₹999"
                  value={settings.announcement_text}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, announcement_text: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Preview</label>
                <div className="border rounded-xl bg-gray-100 px-5 py-3 text-sm text-gray-700">
                  {settings.announcement_text || "—"}
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                disabled={savingSettings}
                onClick={handleSaveSettings}
                className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold transition"
              >
                {savingSettings ? "Saving…" : "Save Announcement"}
              </button>
            </div>
          </section>

          {/* Hero Banner */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">🖼 Hero Banner</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage the main banner shown at the top of your homepage.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={bannerForm.status === "ACTIVE"}
                  onChange={(e) =>
                    setBannerForm((f) => ({
                      ...f,
                      status: e.target.checked ? "ACTIVE" : "INACTIVE",
                    }))
                  }
                />
                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-500 relative after:absolute after:left-1 after:top-1 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
              </label>
            </div>

            <div className="max-w-3xl space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Title
                </label>
                <input
                  type="text"
                  placeholder="Summer Collection 2026"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Banner Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Flat 50% OFF on Vintage Shirts"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 resize-none focus:ring-2 focus:ring-pink-500 outline-none"
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Collection"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={bannerForm.button_text}
                    onChange={(e) =>
                      setBannerForm((f) => ({ ...f, button_text: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Button Link
                  </label>
                  <input
                    type="text"
                    placeholder="/shop"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={bannerForm.button_link}
                    onChange={(e) =>
                      setBannerForm((f) => ({ ...f, button_link: e.target.value }))
                    }
                  />
                  {bannerForm.discount_percent > 0 && activeBanner && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      Auto-filled from discount — edit if you need a different target.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Discount %
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="10"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={bannerForm.discount_percent}
                    onChange={(e) => handleBannerDiscountChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Desktop Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDesktopImageFile(e.target.files[0] || null)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setMobileImageFile(e.target.files[0] || null)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  disabled={savingBanner}
                  onClick={handleSaveBanner}
                  className="flex-1 bg-gray-900 hover:bg-pink-600 disabled:opacity-50 transition text-white font-semibold px-6 py-3 rounded-xl"
                >
                  {savingBanner ? "Saving…" : activeBanner ? "Update Banner" : "Create Banner"}
                </button>

                <button
                  type="button"
                  disabled={!activeBanner}
                  onClick={() => setShowBannerProductPicker((prev) => !prev)}
                  className="flex-1 border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 rounded-xl py-3 font-semibold text-sm transition"
                >
                  {showBannerProductPicker
                    ? "Close Products"
                    : `Select Products (${activeBanner?.products?.length || 0})`}
                </button>
              </div>

              {showBannerProductPicker && (
                <ProductPickerBox
                  allProducts={allProducts}
                  selectedIds={activeBanner?.products || []}
                  onToggleProduct={handleToggleBannerProduct}
                  categories={categories}
                  title="Hero Banner Products"
                  onClose={() => setShowBannerProductPicker(false)}
                />
              )}
            </div>
          </section>

          {/* Promotional Cards */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">🎁 Promotional Cards</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage the promotional cards displayed below the homepage banner.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCardModal(true)}
                className="px-5 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-sm font-semibold shadow-sm transition"
              >
                + Add Card
              </button>
            </div>

            {categories.length === 0 && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
                No categories loaded yet — check that /admin/categories returns data.
              </p>
            )}

            <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-6">
              {cards.map((card) => (
                <div
                  key={card.card_id}
                  className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-44 bg-gradient-to-r from-gray-900 via-gray-800 to-black">
                      {card.image_url && (
                        <img
                          src={card.image_url}
                          alt={card.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                      {card.discount_percent > 0 && (
                        <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                          {card.discount_percent}% OFF
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
                        <h3 className="text-white font-bold text-lg drop-shadow-md">{card.title}</h3>
                        <p className="text-gray-200 text-xs mt-1 drop-shadow-sm">{card.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Title
                        </label>
                        <input
                          defaultValue={card.title}
                          onBlur={(e) => handleUpdateCard(card.card_id, { title: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Subtitle
                        </label>
                        <input
                          defaultValue={card.subtitle}
                          onBlur={(e) =>
                            handleUpdateCard(card.card_id, { subtitle: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          key={`cat-${card.card_id}-${card.category_id ?? "none"}`}
                          defaultValue={card.category_id ?? ""}
                          onChange={(e) => handleCardCategoryChange(card, e.target.value)}
                          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none bg-white text-sm"
                        >
                          <option value="">No category</option>
                          {categories.map((cat) => (
                            <option key={cat.category_id} value={cat.category_id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Discount %
                          </label>
                          <input
                            key={`discount-${card.card_id}-${card.discount_percent ?? ""}`}
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={card.discount_percent ?? ""}
                            onBlur={(e) => handleCardDiscountBlur(card, e.target.value)}
                            placeholder="10"
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Button Link
                          </label>
                          <input
                            key={`link-${card.card_id}-${card.button_link ?? ""}`}
                            defaultValue={card.button_link || "/shop"}
                            onBlur={(e) =>
                              handleUpdateCard(card.card_id, { button_link: e.target.value })
                            }
                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-pink-500 outline-none text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Replace Image
                        </label>
                        <label className="block border-2 border-dashed border-gray-300 rounded-xl py-4 text-center hover:border-pink-500 transition cursor-pointer">
                          <span className="text-pink-500 font-semibold text-xs">
                            Upload New Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) handleUpdateCard(card.card_id, { image: file });
                            }}
                          />
                        </label>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-sm font-medium text-gray-700">Active</span>
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!card.is_active}
                            onChange={(e) =>
                              handleUpdateCard(card.card_id, { is_active: e.target.checked })
                            }
                          />
                          <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-pink-500 relative after:absolute after:left-1 after:top-0.5 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setOpenCardPicker((prev) => (prev === card.card_id ? null : card.card_id))
                        }
                        className="w-full border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 rounded-xl py-2.5 font-medium text-sm transition"
                      >
                        {openCardPicker === card.card_id
                          ? "Close Products"
                          : `Select Products (${card.products?.length || 0})`}
                      </button>

                      {openCardPicker === card.card_id && (
                        <ProductPickerBox
                          allProducts={allProducts}
                          selectedIds={card.products || []}
                          onToggleProduct={(product) => handleToggleCardProduct(card, product)}
                          categories={categories}
                          title={`${card.title || "Card"} Products`}
                          onClose={() => setOpenCardPicker(null)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.card_id)}
                      className="w-full border border-red-200 text-red-500 hover:bg-red-50 rounded-xl py-2 font-medium text-sm transition"
                    >
                      Delete Card
                    </button>
                  </div>
                </div>
              ))}

              {cards.length === 0 && (
                <p className="text-sm text-gray-500 col-span-full text-center py-8">
                  No promotional cards yet. Click "+ Add Card" to create one.
                </p>
              )}
            </div>
          </section>

          {/* Featured Products */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-gray-900">⭐ Featured Products</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select products that will appear in the Featured Products section on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProductPicker((s) => !s)}
                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition"
              >
                {showProductPicker ? "Close Products" : "+ Select Products"}
              </button>
            </div>

            {showProductPicker && (
              <ProductPickerBox
                allProducts={allProducts}
                selectedIds={featured || []}
                onToggleProduct={handleToggleFeatured}
                categories={categories}
                title="Featured Products"
                onClose={() => setShowProductPicker(false)}
              />
            )}

            <div className="grid lg:grid-cols-2 gap-5 mt-6">
              {featured.map((item) => (
                <div
                  key={item.featured_id}
                  className="flex items-center justify-between border rounded-2xl p-4 hover:shadow-md transition bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">👗</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{item.product_name}</h3>
                      <p className="text-pink-600 font-bold mt-1 text-sm">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeatured(item.featured_id)}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-100 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {featured.length === 0 && (
              <div className="mt-8 border-2 border-dashed border-gray-300 rounded-2xl py-10 text-center">
                <h3 className="font-semibold text-gray-700">
                  Want to feature more products?
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  Click "+ Select Products" to choose products from your catalog.
                </p>
              </div>
            )}
          </section>

          {/* Flash Sale */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ⚡ Flash Sale
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Create limited-time promotional campaigns for selected products.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={!!activeFlashSale?.is_active}
                    readOnly
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-500 relative after:absolute after:left-1 after:top-1 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                </label>

                <button
                  type="button"
                  disabled={!activeFlashSale}
                  onClick={() => setShowFlashProductPicker((prev) => !prev)}
                  className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
                >
                  {showFlashProductPicker ? "Close Products" : "Select Products"}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* LEFT SIDE */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Sale Title</label>
                  <input
                    type="text"
                    className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Mega Weekend Sale"
                    value={flashForm.title}
                    onChange={(e) => setFlashForm((f) => ({ ...f, title: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    rows={3}
                    className="w-full border rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Up to 50% OFF..."
                    value={flashForm.description}
                    onChange={(e) => setFlashForm((f) => ({ ...f, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Discount %</label>
                    <input
                      type="number"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.discount_value}
                      onChange={(e) => setFlashForm((f) => ({ ...f, discount_value: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Badge</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.badge}
                      onChange={(e) => setFlashForm((f) => ({ ...f, badge: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Button Text</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.button_text}
                      onChange={(e) => setFlashForm((f) => ({ ...f, button_text: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Button Link</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.button_link}
                      onChange={(e) => setFlashForm((f) => ({ ...f, button_link: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.start_date}
                      onChange={(e) => setFlashForm((f) => ({ ...f, start_date: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-pink-500"
                      value={flashForm.end_date}
                      onChange={(e) => setFlashForm((f) => ({ ...f, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFlashImageFile(e.target.files[0] || null)}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                  />
                </div>

                {showFlashProductPicker && (
                  <ProductPickerBox
                    allProducts={allProducts}
                    selectedIds={activeFlashSale?.products || []}
                    onToggleProduct={handleToggleFlashProduct}
                    categories={categories}
                    title="Flash Sale Products"
                    onClose={() => setShowFlashProductPicker(false)}
                  />
                )}

                <button
                  type="button"
                  disabled={savingFlashSale}
                  onClick={handleSaveFlashSale}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition shadow-md"
                >
                  {savingFlashSale ? "Saving..." : activeFlashSale ? "Update Flash Sale" : "Create Flash Sale"}
                </button>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Live Preview</h3>
                  <div className="relative min-h-[320px] w-full overflow-hidden rounded-2xl border shadow-sm flex flex-col justify-center items-center text-center p-8 bg-gradient-to-r from-gray-900 via-gray-800 to-black">
                    {flashImageFile ? (
                      <img
                        src={URL.createObjectURL(flashImageFile)}
                        alt="Flash Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : activeFlashSale?.banner_image ? (
                      <img
                        src={activeFlashSale.banner_image}
                        alt="Flash Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : null}

                    <div className="absolute inset-0 bg-black/50" />

                    <div className="relative z-10 flex flex-col items-center">
                      <span className="mb-4 rounded-full bg-white px-4 py-1.5 text-xs font-bold tracking-widest text-red-600 shadow">
                        {flashForm.badge || "HOT DEAL"}
                      </span>
                      <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
                        {flashForm.title || "Sale Title"}
                      </h2>
                      <p className="mt-3 max-w-md text-red-100 text-sm leading-relaxed drop-shadow">
                        {flashForm.description || "Sale description goes here..."}
                      </p>
                      <button
                        type="button"
                        className="mt-6 rounded-full bg-white px-6 py-2.5 font-bold text-red-600 shadow-lg text-sm"
                      >
                        {flashForm.button_text || "Shop Now"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Selected Products</h3>
                    <span className="text-xs bg-pink-50 text-pink-600 font-bold px-2.5 py-1 rounded-full">
                      {activeFlashSale?.products?.length || 0} Items
                    </span>
                  </div>

                  {activeFlashSale?.products?.length ? (
                    <div className="space-y-2 max-h-60 overflow-y-auto divide-y">
                      {activeFlashSale.products.map((product) => (
                        <div
                          key={product.product_id}
                          className="flex justify-between items-center py-2.5 text-sm"
                        >
                          <div>
                            <h4 className="font-medium text-gray-800">{product.product_name}</h4>
                            {product.price && (
                              <p className="text-xs text-pink-600 font-bold mt-0.5">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFlashProduct(product)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-gray-400">No products selected yet.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-5 py-2.5 rounded-xl shadow-lg text-white font-medium text-xs max-w-lg whitespace-nowrap ${
            toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {showCardModal && (
        <CardFormModal
          categories={categories}
          onClose={() => setShowCardModal(false)}
          onSubmit={handleCreateCard}
        />
      )}
    </AdminLayout>
  );
}
