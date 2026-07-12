import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSiteData } from "../hooks/useSiteData";
import { useCart } from "../hooks/useCart";
import ProductCard from "../components/ui/ProductCard";
import SectionTitle from "../components/ui/SectionTitle";

export default function ProductDetail() {
  const { id } = useParams();
  const { products } = useSiteData();
  const product = products.find((p) => p.id === Number(id)) || products[0];
  const { addToCart, toggleWishlist, wishlist } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("beige");
  const [activeTab, setActiveTab] = useState("description");
  const isWishlisted = wishlist.includes(product.id);
  const related = products.filter((p) => p.id !== product.id).slice(0, 5);

  const sizes = ["XS", "S", "M", "L", "XL"];
  const colors = ["beige", "gray", "black", "navy"];

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
        {/* Image */}
        <div className="bg-gray-50 aspect-square overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl font-bold text-gray-900">$ {product.price.toFixed(2)}</span>
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-sm text-gray-400 line-through">$ {product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-6">
            {[1,2,3,4,5].map((s) => (
              <svg key={s} className={`w-4 h-4 ${s <= 4 ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-xs text-gray-400 ml-1">(24 reviews)</span>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            A versatile piece crafted from premium materials. Designed for everyday wear with a clean, minimal silhouette that pairs effortlessly with any wardrobe.
          </p>

          {/* Color */}
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Color</p>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c === "beige" ? "#e8d9c0" : c === "navy" ? "#1a2a4a" : c }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c ? "border-pink-500 scale-110" : "border-transparent"}`}
                />
              ))}
            </div>
          </div>

          {/* Size */}
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-700 mb-2">Size</p>
            <div className="flex gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`w-9 h-9 text-xs font-semibold border transition-all ${selectedSize === s ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-900"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty + Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border border-gray-200">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-gray-500 hover:text-gray-900">−</button>
              <span className="px-4 py-2 text-sm font-semibold border-x border-gray-200">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="px-3 py-2 text-gray-500 hover:text-gray-900">+</button>
            </div>
            <button
              onClick={() => addToCart(product, qty)}
              className="flex-1 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-pink-500 transition-colors"
            >
              Add to Cart
            </button>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`p-3 border transition-colors ${isWishlisted ? "border-pink-500 text-pink-500" : "border-gray-200 text-gray-400 hover:border-pink-500 hover:text-pink-500"}`}
            >
              <svg className="w-5 h-5" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>SKU: <span className="text-gray-600">FL-{product.id.toString().padStart(4, "0")}</span></p>
            <p>Category: <span className="text-gray-600">Clothing</span></p>
            <p>Tags: <span className="text-gray-600">Fashion, Summer, New</span></p>
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
              {tab === "additional" ? "Additional Info" : tab === "reviews" ? "Reviews (24)" : "Description"}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-500 leading-relaxed max-w-2xl">
          {activeTab === "description" && (
            <p>This premium piece is made from high-quality materials for exceptional comfort and style. The clean silhouette and thoughtful design make it a versatile addition to any wardrobe, suitable for casual and semi-formal occasions alike.</p>
          )}
          {activeTab === "additional" && (
            <table className="w-full text-left">
              <tbody className="divide-y divide-gray-100">
                {[["Material", "95% Cotton, 5% Elastane"], ["Weight", "0.4kg"], ["Dimensions", "30 × 5 × 10 cm"], ["Colors Available", "4"], ["Sizes", "XS, S, M, L, XL"]].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 font-medium text-gray-700 w-40">{k}</td>
                    <td className="py-2 text-gray-500">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {[{ name: "Alex M.", rating: 5, text: "Great quality and fits perfectly. Highly recommend!" }, { name: "Sam T.", rating: 4, text: "Nice product, color is exactly as shown. Fast shipping too." }].map((r) => (
                <div key={r.name} className="border-b border-gray-100 pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                    <div className="flex">
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className={`w-3 h-3 ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p>{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <SectionTitle title="Related Products" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
