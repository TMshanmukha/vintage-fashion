import { createContext, useContext, useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

import { getCart, addToCartApi, updateCartItemApi, removeCartItemApi } from "../api/cartApi";
import { getWishlist, addToWishlist, removeFromWishlistApi } from "../api/wishlistApi";

import useAuth from "../hooks/useAuth";

const CartContext = createContext();
function isLoggedIn() {
  const token = localStorage.getItem("accessToken");
  console.log("Access Token:", token);
  return Boolean(token);
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
  const { accessToken } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const loadCart = useCallback(async () => {
    if (!accessToken) {
        setCartItems([]);
        return;
    }
    try {
      const res = await getCart();
      setCartItems((res.data || []).map(mapCartItem));
    } catch (err) {
      console.error("Failed to load cart:", err);
    }
  }, []);

  const loadWishlist = useCallback(async () => {
    if (!accessToken) {
        setWishlist([]);
        return;
    }
    try {
      const res = await getWishlist();
      setWishlist((res.data || []).map(mapWishlistItem));
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    }
  }, []);


  useEffect(() => {

    if (accessToken) {
        loadCart();
        loadWishlist();
    } else {
        setCartItems([]);
        setWishlist([]);
    }

  }, [accessToken, loadCart, loadWishlist]);

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