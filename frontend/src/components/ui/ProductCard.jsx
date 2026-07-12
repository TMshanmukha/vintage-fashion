import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart";

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const liked = isWishlisted(product.id);

  return (
    <div className="group relative">
      <div className="relative overflow-hidden bg-gray-50 rounded-sm aspect-square mb-3">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.badge && (
          <span
            className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 ${
              product.badge === "New" ? "text-pink-500" : "text-pink-500"
            }`}
          >
            {product.badge}
          </span>
        )}

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 gap-2">
          <button
            onClick={() => addToCart(product)}
            className="bg-white text-gray-900 text-xs font-semibold px-4 py-2 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div>
          <Link
            to={`/product/${product.id}`}
            className="text-sm font-medium text-gray-800 hover:text-pink-500 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-sm text-gray-800">$ {product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-xs text-gray-400 line-through">
                $ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          className={`mt-0.5 flex-shrink-0 transition-colors ${
            liked ? "text-pink-500" : "text-gray-300 hover:text-pink-400"
          }`}
        >
          <svg
            className="w-4 h-4"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}