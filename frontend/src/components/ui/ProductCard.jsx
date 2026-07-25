import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";
import { getProductBySlug } from "../../api/productApi";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      id: product.id,
      name: product.name,
      image: product.image || product.images?.[0],
      price: product.price,
      slug: product.slug,
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart) return;
    setAddingToCart(true);

    try {
      // The listing endpoint doesn't include variants, so fetch full detail
      // to resolve a real variant_id before adding to cart.
      const res = await getProductBySlug(product.slug);
      const variants = res.data?.variants || [];

      if (variants.length === 0) {
        toast.error("This product has no purchasable options yet.");
      } else if (variants.length === 1) {
        addToCart(variants[0].variant_id, 1);
      } else {
        toast("Please choose a size and color first.");
        navigate(`/product/${product.slug}`);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
      toast.error("Something went wrong. Please try again.");
    }

    setAddingToCart(false);
  };

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 mb-3">
        {(product.badge || hasDiscount) && (
          <span className="absolute top-3 left-3 z-10 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
            {product.badge || "Sale"}
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-sm transition-all ${
            wishlisted
              ? "bg-pink-500 text-white opacity-100"
              : "bg-white/80 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-pink-500"
          }`}
        >
          <svg className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <img
          src={product.image || product.images?.[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Quick-add slides up on hover, tucked under the image so it never bumps card height */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <button
            onClick={handleAddToCart}
            disabled={addingToCart}
            className="w-full bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-pink-500 transition-colors disabled:opacity-60"
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      <h3 className="text-sm font-medium text-gray-800 group-hover:text-pink-500 transition-colors line-clamp-2 mb-1">
        {product.name}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-gray-900">
          ₹{product.price}
        </span>
        {hasDiscount && (
          <span className="text-xs text-gray-400 line-through">
            ₹{product.originalPrice}
          </span>
        )}
      </div>
    </Link>
  );
}