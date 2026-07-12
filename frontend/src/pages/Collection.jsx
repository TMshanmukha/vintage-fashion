import { Link } from "react-router-dom";
import { categories } from "../data/products";

export default function Collection() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-100 py-20 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=300&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Collection</h1>
          <nav className="text-xs text-gray-500">
            <Link to="/" className="hover:text-pink-500">Home</Link>
            <span className="mx-2">/</span>
            <span>Collection</span>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Seasonal Collections */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seasonal Collections</h2>
            <div className="w-10 h-0.5 bg-gray-900 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden group aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1504593811423-6dd665756598?w=800&h=600&fit=crop"
                alt="Summer Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white/80 text-xs uppercase tracking-widest mb-1">2025</p>
                <h3 className="text-white text-3xl font-extrabold mb-4">Summer Collection</h3>
                <Link to="/shop" className="inline-block bg-white text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-gray-900 hover:text-white transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
            <div className="relative overflow-hidden group aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1551489186-cf8726f514f8?w=800&h=600&fit=crop"
                alt="Winter Collection"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-8 left-8">
                <p className="text-white/80 text-xs uppercase tracking-widest mb-1">2025</p>
                <h3 className="text-white text-3xl font-extrabold mb-4">Winter Collection</h3>
                <Link to="/shop" className="inline-block bg-white text-gray-900 text-xs font-bold uppercase tracking-widest px-6 py-2.5 hover:bg-gray-900 hover:text-white transition-colors">
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Shop by Category */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
            <div className="w-10 h-0.5 bg-gray-900 mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link to="/shop" key={cat.id} className="group text-center">
                <div className="overflow-hidden aspect-square mb-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-pink-500 transition-colors">{cat.name}</h3>
                <p className="text-xs text-gray-400">{cat.count} products</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
