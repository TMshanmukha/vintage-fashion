import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import { useEffect, useMemo, useState } from "react";

import * as siteSettingsApi from "../../api/siteSettingsApi";
import * as bannerApi from "../../api/bannerApi";
import * as cardApi from "../../api/promotionalCardApi";
import * as featuredApi from "../../api/featuredProductApi";
import * as flashSaleApi from "../../api/flashSaleApi";
import * as sectionApi from "../../api/homepageSectionApi";
import * as productPickerApi from "../../api/ProductPickerApi";
import * as categoryApi from "../../api/categoryApi";
import CardFormModal from "../components/marketing/Cardformmodal";

export default function AdminMarketing() {
  /* ============== TOAST ============== */
  const [toast, setToast] = useState(null); // { message, type: "success" | "error" }

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  /* ============== SITE SETTINGS (announcement bar) ============== */
  const [settings, setSettings] = useState({
    announcement_text: "",
    announcement_enabled: false,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  /* ============== HERO BANNER (using first banner as "the" banner) ============== */
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
  const [bannerProductSearch, setBannerProductSearch] = useState("");

  // Live preview should reflect whatever the admin just picked locally,
  // falling back to the saved banner's image once nothing new is selected.
  const desktopPreviewSrc = useMemo(() => {
    if (desktopImageFile) return URL.createObjectURL(desktopImageFile);
    return activeBanner?.desktop_image_url || null;
  }, [desktopImageFile, activeBanner?.desktop_image_url]);

  useEffect(() => {
    // Clean up the blob URL when the file changes or component unmounts
    return () => {
      if (desktopImageFile && desktopPreviewSrc) {
        URL.revokeObjectURL(desktopPreviewSrc);
      }
    };
  }, [desktopPreviewSrc, desktopImageFile]);

  /* ============== PROMOTIONAL CARDS ============== */
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openCardPicker, setOpenCardPicker] = useState(null); // card_id or null
  const [cardProductSearch, setCardProductSearch] = useState("");

  /* ============== FEATURED PRODUCTS ============== */
  const [featured, setFeatured] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
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
  const [flashProductSearch, setFlashProductSearch] = useState("");

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

  // categoryApi.getCategories() returns { success, message, data } directly
  // — it already unwraps the axios response internally. So this is res.data,
  // not res.data.data.
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

  // Only auto-fills the offer-page link once the banner already exists —
  // brand new banners keep the /shop default until they have an id.
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

  const filteredBannerProducts = allProducts.filter((p) =>
    (p.name || "").toLowerCase().includes(bannerProductSearch.toLowerCase())
  );

  /* ==========================================================
     PROMOTIONAL CARDS
  ========================================================== */
  const [showCardModal, setShowCardModal] = useState(false);

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

  // Discount and Button Link are updated together so the link always
  // reflects the discount state without the admin typing it manually.
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
      updates.button_link = card.discount_percent > 0
        ? `/offer/card/${card.card_id}`
        : "/shop";
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

  const filteredCardProducts = allProducts.filter((p) =>
    (p.name || "").toLowerCase().includes(cardProductSearch.toLowerCase())
  );

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
    } catch (err) {
      console.error("Failed to update featured products:", err);
    }
  }

  async function handleRemoveFeatured(featuredId) {
    try {
      const res = await featuredApi.removeFeaturedProduct(featuredId);
      setFeatured(res.data?.data || []);
    } catch (err) {
      console.error("Failed to remove featured product:", err);
    }
  }

  const filteredProducts = allProducts.filter((p) =>
    (p.name || "").toLowerCase().includes(productSearch.toLowerCase())
  );
  const filteredFlashProducts = allProducts.filter((p) =>
    (p.name || "")
      .toLowerCase()
      .includes(flashProductSearch.toLowerCase())
  );

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
      activeFlashSale.products?.some(
        (p) => p.product_id === product.product_id
      ) || false;

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

  /* ==========================================================
     HOMEPAGE SECTIONS
  ========================================================== */
  async function handleToggleSection(sectionName, currentlyEnabled) {
    try {
      const res = await sectionApi.toggleSection(sectionName, !currentlyEnabled);
      setSections(res.data?.data || []);
    } catch (err) {
      console.error("Failed to toggle section:", err);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <AdminTopbar title="Marketing & Homepage" subtitle="Loading..." />
        <div className="p-8 text-center text-gray-500">Loading marketing data…</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <AdminTopbar
        title="Marketing & Homepage"
        subtitle="Manage homepage banners, promotions, featured products, and storefront visibility."
      />

      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Announcement Bar */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
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
                className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-semibold"
              >
                {savingSettings ? "Saving…" : "Save Announcement"}
              </button>
            </div>
          </section>

          {/* Hero Banner */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
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

            <div className="max-w-3xl">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    placeholder="Summer Collection 2026"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                    value={bannerForm.title}
                    onChange={(e) =>
                      setBannerForm((f) => ({ ...f, title: e.target.value }))
                    }
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
                    onChange={(e) =>
                      setBannerForm((f) => ({ ...f, description: e.target.value }))
                    }
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
                {!activeBanner && (
                  <p className="text-[11px] text-gray-400">
                    Link defaults to /shop until the banner is saved and a discount is set.
                  </p>
                )}

                <button
                  type="button"
                  disabled={savingBanner}
                  onClick={handleSaveBanner}
                  className="w-full bg-gray-900 hover:bg-pink-600 disabled:opacity-50 transition text-white font-semibold px-6 py-3 rounded-xl"
                >
                  {savingBanner ? "Saving…" : activeBanner ? "Update Banner" : "Create Banner"}
                </button>

                <button
                  type="button"
                  disabled={!activeBanner}
                  onClick={() => setShowBannerProductPicker((prev) => !prev)}
                  className="w-full border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 disabled:opacity-50 rounded-xl py-2.5 font-medium text-sm"
                >
                  {showBannerProductPicker
                    ? "Close Products"
                    : `Select Products (${activeBanner?.products?.length || 0})`}
                </button>

                {showBannerProductPicker && (
                  <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Banner Products</h3>
                      <span className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                        {activeBanner?.products?.length || 0} Selected
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full border rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-pink-500 outline-none"
                      value={bannerProductSearch}
                      onChange={(e) => setBannerProductSearch(e.target.value)}
                    />

                    <div className="max-h-72 overflow-y-auto rounded-xl border bg-white divide-y">
                      {filteredBannerProducts.length === 0 && (
                        <p className="text-sm text-gray-400 text-center py-6">
                          No products match "{bannerProductSearch}".
                        </p>
                      )}
                      {filteredBannerProducts.map((product) => {
                        const selected = activeBanner?.products?.some(
                          (p) => p.product_id === product.product_id
                        );

                        return (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <div>
                              <h4 className="font-medium text-gray-800">{product.name}</h4>
                              {product.price && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleBannerProduct(product)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selected
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-pink-500 text-white hover:bg-pink-600"
                                }`}
                            >
                              {selected ? "Remove" : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
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
                className="px-5 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-sm font-semibold"
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
                  className="border rounded-2xl overflow-hidden bg-white hover:shadow-lg transition"
                >
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
                      <span className="absolute top-3 right-3 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full">
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
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
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
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
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
                        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none bg-white"
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
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
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
                          className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 -mt-2">
                      Setting a discount auto-fills Button Link to this card's offer page.
                    </p>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Replace Image
                      </label>
                      <label className="block border-2 border-dashed border-gray-300 rounded-xl py-6 text-center hover:border-pink-500 transition cursor-pointer">
                        <span className="text-pink-500 font-semibold text-sm">
                          Upload Image
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

                    <div className="flex items-center justify-between pt-2">
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
                      className="w-full border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 rounded-xl py-2 font-medium text-sm"
                    >
                      {openCardPicker === card.card_id ? "Close Products" : `Select Products (${card.products?.length || 0})`}
                    </button>

                    {openCardPicker === card.card_id && (
                      <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                        <input
                          type="text"
                          placeholder="Search products..."
                          className="w-full border rounded-lg px-3 py-2 mb-3 text-sm focus:ring-2 focus:ring-pink-500 outline-none"
                          value={cardProductSearch}
                          onChange={(e) => setCardProductSearch(e.target.value)}
                        />
                        <div className="max-h-56 overflow-y-auto rounded-lg border bg-white divide-y">
                          {filteredCardProducts.map((product) => {
                            const selected = card.products?.some(
                              (p) => p.product_id === product.product_id
                            );
                            return (
                              <div
                                key={product.product_id}
                                className="flex items-center justify-between px-3 py-2 hover:bg-gray-50"
                              >
                                <span className="text-sm text-gray-800">{product.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleCardProduct(card, product)}
                                  className={`text-xs font-semibold px-3 py-1 rounded-lg ${selected
                                    ? "bg-red-50 text-red-600"
                                    : "bg-pink-500 text-white"
                                    }`}
                                >
                                  {selected ? "Remove" : "Add"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteCard(card.card_id)}
                      className="w-full mt-2 border border-red-300 text-red-500 hover:bg-red-50 rounded-xl py-2 font-medium"
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
                className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg font-semibold text-sm"
              >
                {showProductPicker ? "Close" : "+ Select Products"}
              </button>
            </div>

            {showProductPicker && (
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Products
                </label>
                <input
                  type="text"
                  placeholder="Search by product name..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-500 outline-none mb-4"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                <div className="max-h-72 overflow-y-auto border rounded-xl divide-y">
                  {filteredProducts.map((p) => {
                    const isFeatured = featured.some((f) => f.product_id === p.product_id);
                    return (
                      <div
                        key={p.product_id}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-sm text-gray-800">{p.name}</span>
                        <button
                          type="button"
                          onClick={() => handleToggleFeatured(p)}
                          className={`text-sm font-semibold ${isFeatured ? "text-red-500" : "text-pink-600"
                            }`}
                        >
                          {isFeatured ? "Remove" : "Add"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-5">
              {featured.map((item) => (
                <div
                  key={item.featured_id}
                  className="flex items-center justify-between border rounded-xl p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                      <p className="text-pink-600 font-semibold mt-2">
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFeatured(item.featured_id)}
                    className="text-red-500 hover:text-red-600 text-sm font-semibold"
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

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  ⚡ Flash Sale
                </h2>
                <p className="text-gray-500 mt-1">
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
                  className="bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-xl font-medium"
                >
                  {showFlashProductPicker ? "Close Products" : "Select Products"}
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">

              {/* LEFT SIDE */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Sale Title</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3"
                      placeholder="Mega Weekend Sale"
                      value={flashForm.title}
                      onChange={(e) => setFlashForm((f) => ({ ...f, title: e.target.value }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      rows={3}
                      className="w-full border rounded-xl px-4 py-3 resize-none"
                      placeholder="Up to 50% OFF..."
                      value={flashForm.description}
                      onChange={(e) => setFlashForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Discount %</label>
                    <input
                      type="number"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.discount_value}
                      onChange={(e) => setFlashForm((f) => ({ ...f, discount_value: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Badge</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.badge}
                      onChange={(e) => setFlashForm((f) => ({ ...f, badge: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Button Text</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.button_text}
                      onChange={(e) => setFlashForm((f) => ({ ...f, button_text: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Button Link</label>
                    <input
                      type="text"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.button_link}
                      onChange={(e) => setFlashForm((f) => ({ ...f, button_link: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.start_date}
                      onChange={(e) => setFlashForm((f) => ({ ...f, start_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      className="w-full border rounded-xl px-4 py-3"
                      value={flashForm.end_date}
                      onChange={(e) => setFlashForm((f) => ({ ...f, end_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Banner Image</label>
                    <div className="border-2 border-dashed rounded-xl p-6 text-center">
                      <p className="text-sm text-gray-600">
                        {flashImageFile ? flashImageFile.name : "Upload Flash Sale Image"}
                      </p>
                      <label className="inline-block mt-4 bg-pink-500 hover:bg-pink-600 text-white px-5 py-2 rounded-lg cursor-pointer">
                        Choose Image
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => setFlashImageFile(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Selected Products</label>
                    <div className="border rounded-xl h-44 overflow-y-auto divide-y">
                      {activeFlashSale?.products?.length ? (
                        activeFlashSale.products.map((product) => (
                          <div
                            key={product.product_id}
                            className="flex justify-between items-center px-4 py-3"
                          >
                            <span className="text-sm">{product.product_name}</span>
                            <span className="text-pink-600 font-semibold">₹{product.price}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-sm text-gray-400">
                          No products selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {showFlashProductPicker && (
                  <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-800">Flash Sale Products</h3>
                      <span className="text-xs bg-pink-100 text-pink-600 px-3 py-1 rounded-full">
                        {activeFlashSale?.products?.length || 0} Selected
                      </span>
                    </div>

                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full border rounded-xl px-4 py-3 mb-4 focus:ring-2 focus:ring-pink-500 outline-none"
                      value={flashProductSearch}
                      onChange={(e) => setFlashProductSearch(e.target.value)}
                    />

                    <div className="max-h-72 overflow-y-auto rounded-xl border bg-white divide-y">
                      {filteredFlashProducts.map((product) => {
                        const selected = activeFlashSale?.products?.some(
                          (p) => p.product_id === product.product_id
                        );

                        return (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                          >
                            <div>
                              <h4 className="font-medium text-gray-800">{product.name}</h4>
                              {product.price && (
                                <p className="text-xs text-gray-500 mt-1">
                                  ₹{Number(product.price).toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleFlashProduct(product)}
                              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${selected
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-pink-500 text-white hover:bg-pink-600"
                                }`}
                            >
                              {selected ? "Remove" : "Add"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  disabled={savingFlashSale}
                  onClick={handleSaveFlashSale}
                  className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition"
                >
                  {savingFlashSale ? "Saving..." : activeFlashSale ? "Update Flash Sale" : "Create Flash Sale"}
                </button>
              </div>

              {/* RIGHT SIDE */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Live Preview</h3>
                  <div className="relative min-h-[360px] w-full overflow-hidden rounded-2xl border shadow-sm">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: flashImageFile
                          ? `url(${URL.createObjectURL(flashImageFile)})`
                          : activeFlashSale?.banner_image
                            ? `url(${activeFlashSale.banner_image})`
                            : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        background:
                          !flashImageFile && !activeFlashSale?.banner_image
                            ? "linear-gradient(to right,#dc2626,#db2777,#ea580c)"
                            : undefined,
                      }}
                    />

                    {/* Overlay */}
                    <div
                      className={`absolute inset-0 ${flashImageFile || activeFlashSale?.banner_image
                        ? "bg-black/40"
                        : "bg-gradient-to-r from-gray-900 via-gray-800 to-black"
                        }`}
                    />

                    {/* Center Content */}
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-10">
                      <span className="mb-5 rounded-full bg-white px-4 py-2 text-xs font-bold tracking-widest text-red-600 shadow">
                        {flashForm.badge || "HOT DEAL"}
                      </span>

                      <h2 className="text-4xl font-extrabold text-white drop-shadow-lg">
                        {flashForm.title || "Sale Title"}
                      </h2>

                      <p className="mt-5 max-w-xl text-red-50 text-base leading-relaxed drop-shadow">
                        {flashForm.description || "Sale description"}
                      </p>

                      <button
                        type="button"
                        className="mt-8 rounded-full bg-white px-8 py-3 font-semibold text-red-600 shadow-lg transition hover:scale-105 hover:bg-red-50"
                      >
                        {flashForm.button_text || "Shop Now"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border rounded-2xl p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800">Selected Products</h3>
                    <span className="text-xs text-gray-500">
                      {activeFlashSale?.products?.length || 0} Items
                    </span>
                  </div>

                  {activeFlashSale?.products?.length ? (
                    <div className="space-y-3">
                      {activeFlashSale.products.map((product) => (
                        <div
                          key={product.product_id}
                          className="flex justify-between items-center border rounded-xl px-4 py-3"
                        >
                          <div>
                            <h4 className="font-medium">{product.product_name}</h4>
                            {product.price && (
                              <p className="text-sm text-gray-500">
                                ₹{Number(product.price).toLocaleString("en-IN")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleFlashProduct(product)}
                            className="text-red-500 hover:text-red-600 text-sm font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-400">No products selected yet.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Homepage Sections */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-900">🏠 Homepage Sections</h2>
              <p className="text-sm text-gray-500 mt-1">
                Enable or disable sections displayed on your storefront homepage.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {sections.map((section) => (
                <div
                  key={section.section_id}
                  className="border rounded-xl p-5 flex items-center justify-between hover:border-pink-300 hover:shadow-sm transition"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">{section.section_name}</h3>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!section.is_enabled}
                      onChange={() =>
                        handleToggleSection(section.section_name, section.is_enabled)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pink-500 relative after:absolute after:left-1 after:top-1 after:bg-white after:h-4 after:w-4 after:rounded-full after:transition-all peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              ))}

              {sections.length === 0 && (
                <p className="text-sm text-gray-500 col-span-full">
                  No sections found — run the seed insert in promotional_cards.sql
                  to populate the 8 default rows.
                </p>
              )}
            </div>

            <div className="mt-8 rounded-xl bg-pink-50 border border-pink-200 p-5">
              <h4 className="font-semibold text-pink-700">💡 Tip</h4>
              <p className="text-sm text-pink-600 mt-2">
                Disabling a section hides it from your customers without deleting
                any data. You can enable it again anytime.
              </p>
            </div>
          </section>

        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg text-white font-medium text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
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
