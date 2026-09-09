import { Routes, Route } from "react-router-dom";
import { CartProvider } from "./hooks/useCart";
import { SiteDataProvider } from "./hooks/useSiteData";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import ProtectedRoute from "./admin/components/ProtectedRoute";

import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
//import Blog from "./pages/Blog";
//import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Collection from "./pages/Collection";

import AdminRoot from "./admin/pages/AdminRoot";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminProducts from "./admin/pages/AdminProducts";
import AdminMarketing from "./admin/pages/AdminMarketing";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminNotifications from "./admin/pages/AdminNotifications";
import AdminEmails from "./admin/pages/AdminEmails";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminReviews from "./admin/pages/AdminReviews";
import AuthPage from "./pages/AuthPage";
import LikedClothesPage from "./pages/LikedClothesPage";
import MyAccountPage from "./pages/MyAccountPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import AdminCategories from "./admin/pages/CategoryPage";
import AdminBrands from "./admin/pages/AdminBrands";
import AdminReturns from "./admin/pages/AdminReturns";
import OfferPage from "./pages/OfferPage";

function StoreFront() {
  return (
    <Layout>
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
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <SiteDataProvider>
        <AdminAuthProvider>
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
        </AdminAuthProvider>
      </SiteDataProvider>
    </>

  );
}