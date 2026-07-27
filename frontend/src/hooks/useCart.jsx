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
  return {
    id: row.cart_item_id,
    variantId: row.variant_id,
    productId: row.product_id,
    name: row.name,
    price: Number(row.price),
    image: row.image_url,
    qty: row.quantity,
    size: row.size,
    color: row.color,
    slug: row.slug,
  };
}

function mapWishlistItem(row) {
  return {
    id: row.product_id,
    name: row.name,
    image: row.image_url,
    price: Number(row.price),
    slug: row.slug,
    path: `/product/${row.slug}`,
  };
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const loadCart = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await getCart();
      setCartItems((res.data || []).map(mapCartItem));
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    if (!isLoggedIn()) return;
    try {
      const res = await getWishlist();
      setWishlist((res.data || []).map(mapWishlistItem));
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  }, []);

  // Depending on `user` (not just running once at mount) is what actually
  // fixes login: it re-runs the instant AuthProvider's user state flips
  // from null to a real user — which happens synchronously in this same
  // tab right after a successful login, with no network round-trip to
  // wait on. This covers: fresh page load already logged in, AND logging
  // in during the current SPA session without a refresh.
  useEffect(() => {
    if (!user) return;
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
      window.location.href = "/auth";
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

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  // --- WISHLIST ---

  const isWishlisted = (productId) => wishlist.some((w) => w.id === productId);

  // Accepts either a product-like object { id, name, image, price, slug } or a raw productId
  const toggleWishlist = async (product) => {
    if (!isLoggedIn()) {
      toast.error("Please log in to save items.");
      window.location.href = "/auth";
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
        cartItems,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,

        wishlist,
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