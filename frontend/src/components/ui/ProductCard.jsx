import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import { getProductBySlug } from "../../api/productApi";
import { setPendingAction } from "../../utils/pendingCartAction";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);

  const wishlisted = isWishlisted(product.id);

const price = Number(product.price);

const originalPrice = Number(product.originalPrice ?? price);

const discountPercent = Number(product.discountPercent) || 0;

const hasDiscount =
  discountPercent > 0 &&
  originalPrice > price;
    
  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      setPendingAction({ action: "wishlist", slug: product.slug });
      toast("Please log in to use your wishlist.");
      navigate(`/auth?redirect=/product/${product.slug}`);
      return;
    }

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

    if (!user) {
      // We don't know the variant yet on a listing card, so send them to
      // login and let the product page finish the job once they're back.
      setPendingAction({ action: "cart", slug: product.slug, qty: 1 });
      toast("Please log in to add items to your cart.");
      navigate(`/auth?redirect=/product/${product.slug}`);
      return;
    }

    setAddingToCart(true);

    try {
      // The listing endpoint doesn't include variants, so fetch full detail
      // to resolve a real variant_id before adding to cart.
      const res = await getProductBySlug(product.slug);

      const variants = res.data.variants || [];

      if (variants.length === 0) {
        toast.error("This product has no purchasable options yet.");
      } else if (variants.length === 1) {
        if (variants[0].stock_quantity <= 0) {
          toast.error("This product is out of stock.");
        } else {
          addToCart(variants[0].variant_id, 1);
          toast.success("Added to cart!");
        }
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
        {/* Admin-set badge and real discount status are independent facts —
            both can show at once, neither hides the other. */}
        <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1">
          {product.badge && (
            <span className="bg-gray-900 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
              {product.badge}
            </span>
          )}
          {hasDiscount && (
            <span className="bg-pink-500 text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1">
              {discountPercent}% OFF
            </span>
          )}
        </div>

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
            ₹{price.toFixed(2)}
        </span>

        <span className="text-xs text-gray-400 line-through">
            ₹{originalPrice.toFixed(2)}
        </span>

        {/* {hasDiscount && (
            <span className="text-xs font-semibold text-pink-500">
                {discountPercent}% OFF
            </span>
        )} */}

      </div>
    </Link>
  );
}