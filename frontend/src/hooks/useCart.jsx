import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import { getCart, addToCartApi, updateCartItemApi, removeCartItemApi } from "../api/cartApi";
import { getWishlist, addToWishlist, removeFromWishlistApi } from "../api/wishlistApi";
import useSocket from "./Usesocket";
import useAuth from "../hooks/useAuth";

const CartContext = createContext();

function isLoggedIn() {
  return Boolean(localStorage.getItem("accessToken"));
}

function mapCartItem(row) {
  const price = Number(row.price);
  const safePrice = isNaN(price) ? 0 : price;
  const originalPrice = row.original_price != null ? Number(row.original_price) : safePrice;
  const safeOriginalPrice = isNaN(originalPrice) || originalPrice < safePrice ? safePrice : originalPrice;
  const qty = Number(row.quantity);
  const safeQty = isNaN(qty) || qty < 1 ? 1 : qty;

  return {
    id: row.cart_item_id,
    variantId: row.variant_id,
    productId: row.product_id,
    name: row.name || "Product",
    price: safePrice,
    image: row.image_url,
    qty: safeQty,
    size: row.size,
    color: row.color,
    slug: row.slug,

    original_price: safeOriginalPrice,
    discount_percent: Number(row.discount_percent) || 0,
    discount_amount: Number(row.discount_amount) || 0,
    promotion_id: row.promotion_id,
  };
}

function mapWishlistItem(row) {
  const price = Number(row.price);
  const safePrice = isNaN(price) ? 0 : price;

  return {
    id: row.product_id,
    name: row.name || "Product",
    image: row.image_url,
    price: safePrice,
    slug: row.slug,
    path: `/product/${row.slug}`,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  // Starts true when a token already exists, so the very first render
  // (before the load effect below even fires) doesn't look "empty" to
  // a page that's checking cartItems.length.
  const [cartLoading, setCartLoading] = useState(() => isLoggedIn());
  const [wishlistLoading, setWishlistLoading] = useState(() => isLoggedIn());
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isLoggedIn()) {
      setCartLoading(false);
      return;
    }
    setCartLoading(true);
    try {
      const res = await getCart();
      setCartItems((res.data || []).map(mapCartItem));
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setCartLoading(false);
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    if (!isLoggedIn()) {
      setWishlistLoading(false);
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await getWishlist();
      setWishlist((res.data || []).map(mapWishlistItem));
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  // Depending on `user` (not just running once at mount) is what actually
  // fixes login: it re-runs the instant AuthProvider's user state flips
  // from null to a real user — which happens synchronously in this same
  // tab right after a successful login, with no network round-trip to
  // wait on. This covers: fresh page load already logged in, AND logging
  // in during the current SPA session without a refresh.
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setWishlist([]);
      setCartLoading(false);
      setWishlistLoading(false);
      return;
    }
    loadCart();
    loadWishlist();
  }, [user, loadCart, loadWishlist]);

  // The socket listener below is for events this tab can't know about on
  // its own — chiefly, another tab or device logging this user out (or
  // in), where there's no local `user` state change to react to. It is
  // NOT relied on for this tab's own login, since the socket can't be
  // connected yet at the moment login itself completes (see useSocket).
  useSocket({
    "session:changed": ({ event }) => {
      if (event === "logout") {
        setCartItems([]);
        setWishlist([]);
      } else if (event === "login") {
        loadCart();
        loadWishlist();
      }
    },
  });

  // --- CART ---

  // variantId is required (cart_items references product_variants, not products)
  const addToCart = async (variantId, qty = 1) => {
    if (!isLoggedIn()) {
      toast.error("Please log in to add items to your cart.");
      // Preserve the page the user was on, same as the login redirects
      // used elsewhere, instead of always dropping them at a bare /auth.
      window.location.href = `/auth?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    if (!variantId) {
      toast.error("Please select a size and color first.");
      return;
    }

    try {
      const res = await addToCartApi(variantId, qty);
      setCartItems((res.data || []).map(mapCartItem));
      toast.success("Added to cart.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart.");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await removeCartItemApi(cartItemId);
      setCartItems((res.data || []).map(mapCartItem));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove item.");
    }
  };

  const updateQty = async (cartItemId, newQty) => {
    if (newQty < 1) {
      return removeFromCart(cartItemId);
    }

    try {
      const res = await updateCartItemApi(cartItemId, newQty);
      setCartItems((res.data || []).map(mapCartItem));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update quantity.");
    }
  };

  const clearCart = () => setCartItems([]);

  const effectiveCartItems = user ? cartItems : [];
  const effectiveWishlist = user ? wishlist : [];

  const cartTotal = effectiveCartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1),
    0
  );
  const cartCount = effectiveCartItems.reduce((sum, item) => sum + (Number(item.qty) || 1), 0);

  // --- WISHLIST ---

  const isWishlisted = (productId) => effectiveWishlist.some((w) => w.id === productId);

  // Accepts either a product-like object { id, name, image, price, slug } or a raw productId
  const toggleWishlist = async (product) => {
    if (!isLoggedIn()) {
      toast.error("Please log in to save items.");
      window.location.href = `/auth?redirect=${encodeURIComponent(
        window.location.pathname
      )}`;
      return;
    }

    const productId = typeof product === "object" ? product.id : product;

    try {
      if (isWishlisted(productId)) {
        await removeFromWishlistApi(productId);
        setWishlist((prev) => prev.filter((w) => w.id !== productId));
        toast.success("Removed from wishlist.");
      } else {
        await addToWishlist(productId);
        await loadWishlist();
        toast.success("Added to wishlist.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update wishlist.");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await removeFromWishlistApi(productId);
      setWishlist((prev) => prev.filter((w) => w.id !== productId));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove from wishlist.");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems: effectiveCartItems,
        cartLoading,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,

        wishlist: effectiveWishlist,
        wishlistLoading,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}