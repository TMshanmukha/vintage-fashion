import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../hooks/useCart";
import useAuth from "../hooks/useAuth";
import { getProductBySlug, getProducts } from "../api/productApi";
import { setPendingAction, getPendingAction, clearPendingAction } from "../utils/pendingCartAction";
import ProductCard from "../components/ui/ProductCard";
import SectionTitle from "../components/ui/SectionTitle";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [activeImage, setActiveImage] = useState(0);

  // Guards against replaying a pending cart/wishlist action twice
  const pendingHandled = useRef(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      pendingHandled.current = false;

      try {
        const res = await getProductBySlug(slug);
        const product = res.data;

        setProduct(product);

        // If the user was redirected here to log in, restore their
        // previous size/color choice instead of defaulting to variant 0.
        const pending = getPendingAction();
        const hasMatchingPending = pending && pending.slug === slug;

        if (hasMatchingPending && pending.color) {
          setSelectedColor(pending.color);
        } else if (product.variants?.length) {
          setSelectedColor(product.variants[0].color);
        }

        if (hasMatchingPending && pending.size) {
          setSelectedSize(pending.size);
        } else if (product.variants?.length) {
          setSelectedSize(product.variants[0].size);
        }

        if (product.category_id) {
          const relatedRes = await getProducts({
            category: product.category_id,
            limit: 6,
          });

          setRelated(
            (relatedRes.data || [])
              .filter((p) => p.product_id !== product.product_id)
              .slice(0, 5)
          );
        }
      } catch (err) {
        console.error("Failed to load product:", err);
        setProduct(null);
      }

      setLoading(false);
    })();
  }, [slug]);

  // Full list of every color / size that exists on this product — always
  // rendered in full, never hidden.
  const sizes = useMemo(
    () => [...new Set((product?.variants || []).map((v) => v.size).filter(Boolean))],
    [product]
  );

  const colors = useMemo(
    () => [...new Set((product?.variants || []).map((v) => v.color).filter(Boolean))],
    [product]
  );

  // Colors are ONLY disabled if that color has zero stock across every
  // size it comes in — a fully sold-out color. They are never affected
  // by which size is currently selected.
  const isColorAvailable = (color) => {
    if (!product?.variants) return false;
    return product.variants.some((v) => v.color === color && v.stock_quantity > 0);
  };

  // Sizes are driven entirely by the selected color: available only if
  // that exact color+size combo exists and is in stock. If no color is
  // selected yet, fall back to "in stock for any color".
  const isSizeAvailable = (size) => {
    if (!product?.variants) return false;

    if (selectedColor) {
      const variant = product.variants.find(
        (v) => v.color === selectedColor && v.size === size
      );
      return Boolean(variant) && variant.stock_quantity > 0;
    }

    return product.variants.some((v) => v.size === size && v.stock_quantity > 0);
  };

  // Selecting a color never touches which colors are shown — it only
  // recalculates which sizes are valid for it, clearing (or auto-picking,
  // if only one option) the size if it's no longer valid.
  const handleColorSelect = (color) => {
    setSelectedColor(color);

    const availableSizesForColor = sizes.filter((s) => {
      const variant = product.variants.find(
        (v) => v.color === color && v.size === s
      );
      return Boolean(variant) && variant.stock_quantity > 0;
    });

    if (!availableSizesForColor.includes(selectedSize)) {
      setSelectedSize(
        availableSizesForColor.length === 1 ? availableSizesForColor[0] : null
      );
    }
  };

  // Selecting a size never disables or filters colors — colors stay fully
  // clickable at all times.
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const selectedVariant = useMemo(() => {
    if (!product?.variants) return null;
    return product.variants.find(
      (v) => v.size === selectedSize && v.color === selectedColor
    );
  }, [product, selectedSize, selectedColor]);

  const primaryImage =
    product?.images?.find((img) => img.is_primary)?.image_url ||
    product?.images?.[0]?.image_url;

  const performAddToCart = () => {
    if (product.variants?.length && !selectedVariant) {
      toast.error("Please select an available size and color.");
      return;
    }

    if (selectedVariant && selectedVariant.stock_quantity <= 0) {
      toast.error("This size and color is out of stock.");
      return;
    }

    if (selectedVariant && selectedVariant.stock_quantity < qty) {
      toast.error("Not enough stock for this selection.");
      return;
    }

    addToCart(selectedVariant ? selectedVariant.variant_id : null, qty);
  };

  // Replay a pending cart/wishlist action once the user is logged in
  // and the product + selection have finished loading.
  useEffect(() => {
    if (pendingHandled.current) return;
    if (!user || !product) return;

    const pending = getPendingAction();
    if (!pending || pending.slug !== slug) return;

    pendingHandled.current = true;
    clearPendingAction();

    if (pending.action === "wishlist") {
      toggleWishlist({
        id: product.product_id,
        name: product.name,
        image: primaryImage,
        price: product.price,
        slug: product.slug,
      });
      toast.success("Added to wishlist!");
    } else if (pending.action === "cart") {
      // selectedVariant may not be resolved on the very same render this
      // effect fires, so give React a tick to settle the selection.
      setTimeout(() => performAddToCart(), 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, product, selectedVariant]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-100 w-3/4" />
            <div className="h-4 bg-gray-100 w-1/4" />
            <div className="h-4 bg-gray-100 w-full" />
            <div className="h-4 bg-gray-100 w-full" />
            <div className="h-10 bg-gray-100 w-1/2 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Product not found</h2>
        <Link to="/shop" className="text-pink-500 hover:underline text-sm">
          Back to Shop
        </Link>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.product_id);

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction({
        action: "cart",
        slug,
        size: selectedSize,
        color: selectedColor,
        qty,
      });
      toast("Please log in to add items to your cart.");
      navigate(`/auth?redirect=/product/${slug}`);
      return;
    }

    performAddToCart();
  };

  const handleToggleWishlist = () => {
    if (!user) {
      setPendingAction({
        action: "wishlist",
        slug,
        size: selectedSize,
        color: selectedColor,
        qty,
      });
      toast("Please log in to use your wishlist.");
      navigate(`/auth?redirect=/product/${slug}`);
      return;
    }

    toggleWishlist({
      id: product.product_id,
      name: product.name,
      image: primaryImage,
      price: product.price,
      slug: product.slug,
    });
  };

  const prevImage = () => {
    setActiveImage((prev) =>
        prev === 0
            ? product.images.length - 1
            : prev - 1
    );
  };

  const nextImage = () => {
    setActiveImage((prev) =>
        prev === product.images.length - 1
            ? 0
            : prev + 1
    );
  };

  const addToCartDisabled =
    (product.variants?.length && !selectedVariant) ||
    (selectedVariant && selectedVariant.stock_quantity <= 0);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-pink-500">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/shop" className="hover:text-pink-500">Shop</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700 font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="flex flex-col-reverse sm:flex-row gap-4">
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
            {product.images?.map((img, index) => (
              <button
                key={img.image_id || index}
                type="button"
                onClick={() => setActiveImage(index)}
                onMouseEnter={() => setActiveImage(index)}
                className={`overflow-hidden rounded-md border-2 flex-shrink-0 transition ${
                  activeImage === index
                    ? "border-pink-500 shadow-sm"
                    : "border-gray-200 hover:border-gray-400"
                }`}>
                <img
                  src={img.image_url}
                  alt=""
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover"
                />
              </button>
            ))}
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl aspect-square overflow-hidden border border-gray-100">
            <img
              src={
                product.images?.[activeImage]?.image_url ||
                primaryImage
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {(() => {
            const currentPrice = Number(product.final_price ?? product.price) || 0;
            const originalPrice = product.original_price != null ? Number(product.original_price) : Number(product.price || currentPrice);
            const discountPercent = Number(product.discount_percent) || (originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);
            const hasDiscount = discountPercent > 0 && originalPrice > currentPrice;

            return (
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="text-2xl font-extrabold text-gray-900">
                  ₹ {currentPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      ₹ {originalPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1 rounded-full">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}
              </div>
            );
          })()}

          {/* Stars */}
          <div className="flex items-center gap-1 mb-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <svg
                key={s}
                className={`w-4 h-4 ${s <= Math.round(product.average_rating || 0) ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-400 ml-1">({product.review_count || 0} reviews)</span>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-6">{product.description}</p>

          {/* Color — always fully clickable, only disabled if the color
              is completely sold out across every size. */}
          {colors.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">
                Color
                {selectedColor && (
                  <span className="ml-2 text-gray-400 normal-case tracking-normal font-normal">
                    {selectedColor}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => {
                  const available = isColorAvailable(c);
                  return (
                    <button
                      key={c}
                      onClick={() => available && handleColorSelect(c)}
                      disabled={!available}
                      title={available ? c : `${c} — Out of stock`}
                      style={{
                        backgroundColor:
                          product.variants.find((v) => v.color === c)?.color_hex || c,
                      }}
                      className={`relative w-7 h-7 rounded-full border-2 transition-all ${
                        selectedColor === c ? "border-pink-500 scale-110" : "border-transparent"
                      } ${!available ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
                    >
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="w-full h-[1.5px] bg-gray-500 rotate-45" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size — availability driven entirely by the selected color.
              Selecting a size does NOT affect which colors are clickable. */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = isSizeAvailable(s);
                  return (
                    <button
                      key={s}
                      onClick={() => available && handleSizeSelect(s)}
                      disabled={!available}
                      title={available ? s : "Out of stock in this color"}
                      className={`w-9 h-9 text-xs font-semibold border transition-all ${
                        selectedSize === s
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-200 text-gray-500 hover:border-gray-900"
                      } ${!available ? "opacity-30 bg-gray-50 text-gray-300 cursor-not-allowed line-through hover:border-gray-200" : ""}`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {selectedColor && sizes.every((s) => !isSizeAvailable(s)) && (
                <p className="text-xs text-red-400 mt-2">No sizes available in this color.</p>
              )}
            </div>
          )}

          {/* Qty + Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-500 hover:text-gray-900">−</button>
              <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-gray-500 hover:text-gray-900">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={addToCartDisabled}
              className="flex-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-pink-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
            >
              {addToCartDisabled ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleToggleWishlist}
              className={`p-3 border transition-colors ${
                wishlisted
                  ? "border-pink-500 text-pink-500"
                  : "border-gray-200 text-gray-400 hover:border-pink-500 hover:text-pink-500"
              }`}
            >
              <svg className="w-5 h-5" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>SKU: <span className="text-gray-600">{selectedVariant?.sku_variant || product.sku}</span></p>
            <p>Category: <span className="text-gray-600">{product.category_name}</span></p>
            <p>Brand: <span className="text-gray-600">{product.brand_name}</span></p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16">
        <div className="flex gap-0 border-b border-gray-200 mb-8">
          {["description", "additional", "reviews"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize text-sm font-medium px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"
              }`}
            >
              {tab === "additional" ? "Additional Info" : tab === "reviews" ? `Reviews (${product.review_count || 0})` : "Description"}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 leading-relaxed max-w-2xl">
          {activeTab === "description" && <p>{product.description}</p>}

          {activeTab === "additional" && (
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 font-medium text-gray-700 w-40">SKU</td>
                  <td className="py-2 text-gray-500">{product.sku}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-700 w-40">Sizes</td>
                  <td className="py-2 text-gray-500">{sizes.join(", ") || "—"}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-700 w-40">Colors</td>
                  <td className="py-2 text-gray-500">{colors.join(", ") || "—"}</td>
                </tr>
                <tr>
                  <td className="py-2 font-medium text-gray-700 w-40">Brand</td>
                  <td className="py-2 text-gray-500">{product.brand_name}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === "reviews" && (
            <p className="text-gray-400">No reviews yet.</p>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div>
          <SectionTitle title="Related Products" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {related.map((p) => (
              <ProductCard
                key={p.product_id}
                product={{
                  id: p.product_id,
                  slug: p.slug,
                  name: p.name,
                  price: Number(p.price),
                  originalPrice: p.original_price ? Number(p.original_price) : null,
                  image: p.image_url,
                  images: p.image_url ? [p.image_url] : [],
                  rating: p.average_rating || 0,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}