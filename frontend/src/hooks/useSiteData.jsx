import { createContext, useContext, useState, useEffect } from "react";
import { products as initialProducts } from "../data/products";
import { blogPosts as initialBlogPosts } from "../data/blog";

const STORAGE_KEY = "flone_site_data";

const defaultSiteText = {
  heroEyebrow: "Stylish",
  heroTitle: "Male Clothes",
  heroSubtitle: "30% off Summer Vacation",
  heroCta: "🛍️ Shop Now",
  announcementText: "Free delivery on order over ₹1000",
  newArrivalSubtitle: "Discover the latest collection and find your perfect look today.",
};

const defaultUsers = [
  { id: 1, name: "Alex Morgan", email: "alex.morgan@example.com", joined: "2026-04-12", status: "Active", orders: 4 },
  { id: 2, name: "Priya Nair", email: "priya.nair@example.com", joined: "2026-05-02", status: "Active", orders: 2 },
  { id: 3, name: "Sam Lee", email: "sam.lee@example.com", joined: "2026-05-20", status: "Blocked", orders: 0 },
  { id: 4, name: "Dana Cole", email: "dana.cole@example.com", joined: "2026-06-01", status: "Active", orders: 7 },
  { id: 5, name: "Marco Rossi", email: "marco.rossi@example.com", joined: "2026-06-18", status: "Active", orders: 1 },
];

const defaultNotifications = [
  { id: 1, title: "New order placed", body: "Dana Cole placed an order for $140.00", time: "2 hours ago", read: false, type: "order" },
  { id: 2, title: "Low stock warning", body: "White Sneakers — only 3 left in stock", time: "5 hours ago", read: false, type: "stock" },
  { id: 3, title: "New user registered", body: "Marco Rossi created an account", time: "1 day ago", read: true, type: "user" },
];

function loadInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return {
    products: initialProducts,
    blogPosts: initialBlogPosts,
    siteText: defaultSiteText,
    users: defaultUsers,
    notifications: defaultNotifications,
    emailLog: [],
  };
}

const SiteDataContext = createContext(null);

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(loadInitial);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
  }, [data]);

  // Products
  const addProduct = (product) => {
    setData((d) => {
      const nextId = d.products.length ? Math.max(...d.products.map((p) => p.id)) + 1 : 1;
      return { ...d, products: [...d.products, { ...product, id: nextId }] };
    });
  };
  const updateProduct = (id, updates) => {
    setData((d) => ({ ...d, products: d.products.map((p) => p.id === id ? { ...p, ...updates } : p) }));
  };
  const deleteProduct = (id) => {
    setData((d) => ({ ...d, products: d.products.filter((p) => p.id !== id) }));
  };

  // Site text / offers
  const updateSiteText = (updates) => {
    setData((d) => ({ ...d, siteText: { ...d.siteText, ...updates } }));
  };

  // Users
  const updateUser = (id, updates) => {
    setData((d) => ({ ...d, users: d.users.map((u) => u.id === id ? { ...u, ...updates } : u) }));
  };
  const deleteUser = (id) => {
    setData((d) => ({ ...d, users: d.users.filter((u) => u.id !== id) }));
  };

  // Notifications
  const markNotificationRead = (id) => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
  };
  const markAllNotificationsRead = () => {
    setData((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
  };
  const deleteNotification = (id) => {
    setData((d) => ({ ...d, notifications: d.notifications.filter((n) => n.id !== id) }));
  };
  const addNotification = (notif) => {
    setData((d) => {
      const nextId = d.notifications.length ? Math.max(...d.notifications.map((n) => n.id)) + 1 : 1;
      return { ...d, notifications: [{ id: nextId, time: "Just now", read: false, ...notif }, ...d.notifications] };
    });
  };

  // Email (simulated)
  const sendEmail = (email) => {
    setData((d) => {
      const nextId = d.emailLog.length ? Math.max(...d.emailLog.map((e) => e.id)) + 1 : 1;
      return { ...d, emailLog: [{ id: nextId, sentAt: new Date().toLocaleString(), ...email }, ...d.emailLog] };
    });
  };

  return (
    <SiteDataContext.Provider value={{
      ...data,
      addProduct, updateProduct, deleteProduct,
      updateSiteText,
      updateUser, deleteUser,
      markNotificationRead, markAllNotificationsRead, deleteNotification, addNotification,
      sendEmail,
    }}>
      {children}
    </SiteDataContext.Provider>
  );
}

export const useSiteData = () => useContext(SiteDataContext);
