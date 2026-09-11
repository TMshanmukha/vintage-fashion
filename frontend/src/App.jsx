import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { SiteDataProvider } from "./hooks/useSiteData";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import ProtectedRoute from "./admin/components/ProtectedRoute";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";

// Code-split storefront routes
const Shop = lazy(() => import("./pages/Shop"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Collection = lazy(() => import("./pages/Collection"));
const ReturnsPolicy = lazy(() => import("./pages/ReturnsPolicy"));
const SizeGuide = lazy(() => import("./pages/SizeGuide"));
const FAQ = lazy(() => import("./pages/FAQ"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const LikedClothesPage = lazy(() => import("./pages/LikedClothesPage"));
const MyAccountPage = lazy(() => import("./pages/MyAccountPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const OfferPage = lazy(() => import("./pages/OfferPage"));

// Code-split admin routes
const AdminRoot = lazy(() => import("./admin/pages/AdminRoot"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminProducts = lazy(() => import("./admin/pages/AdminProducts"));
const AdminMarketing = lazy(() => import("./admin/pages/AdminMarketing"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminNotifications = lazy(() => import("./admin/pages/AdminNotifications"));
const AdminEmails = lazy(() => import("./admin/pages/AdminEmails"));
const AdminOrders = lazy(() => import("./admin/pages/AdminOrders"));
const AdminReviews = lazy(() => import("./admin/pages/AdminReviews"));
const AdminCategories = lazy(() => import("./admin/pages/CategoryPage"));
const AdminBrands = lazy(() => import("./admin/pages/AdminBrands"));
const AdminReturns = lazy(() => import("./admin/pages/AdminReturns"));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center py-16">
      <div className="w-8 h-8 rounded-full border-2 border-pink-200 border-t-pink-500 animate-spin" />
    </div>
  );
}

function StoreFront() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/account" element={<MyAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/wishlist" element={<LikedClothesPage />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/offer/:type/:id" element={<OfferPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collection" element={<Collection />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/faqs" element={<FAQ />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <SiteDataProvider>
      <AdminAuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Admin routes */}
            <Route path="/admin" element={<AdminRoot />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/brands"
              element={
                <ProtectedRoute>
                  <AdminBrands />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/returns" element={<ProtectedRoute><AdminReturns /></ProtectedRoute>} />
            <Route path="/admin/offers" element={<ProtectedRoute><AdminMarketing /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/notifications" element={<ProtectedRoute><AdminNotifications /></ProtectedRoute>} />
            <Route path="/admin/emails" element={<ProtectedRoute><AdminEmails /></ProtectedRoute>} />

            {/* Storefront — all other routes */}
            <Route
              path="/*"
              element={
                <CartProvider>
                  <StoreFront />
                </CartProvider>
              }
            />
          </Routes>
        </Suspense>
      </AdminAuthProvider>
    </SiteDataProvider>
  );
}