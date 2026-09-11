import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Collection", path: "/collection" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { cartCount, wishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo & Full Name - compact and always fully visible */}
        <Link to="/" className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <img
            src="/Title_vf2_32.webp"
            alt=""
            aria-hidden="true"
            width="32"
            height="32"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover flex-shrink-0 shadow-sm border border-gray-100"
          />
          <span className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-gray-900 whitespace-nowrap">
            Vintage Fashion
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className={`text-xs font-semibold uppercase tracking-wider transition-colors hover:text-pink-600 ${
                location.pathname === link.path ? "text-pink-600" : "text-gray-700"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions & Icons - Small & compact */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 md:gap-5 flex-shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-1 text-gray-600 hover:text-pink-600 transition-colors"
            aria-label="Toggle search bar"
          >
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Account"
            className="p-1 text-gray-600 hover:text-pink-600 transition-colors"
          >
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <Link
            to="/wishlist"
            className="p-1 text-gray-600 hover:text-pink-600 transition-colors relative"
            aria-label="Wishlist"
          >
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {Boolean(user && wishlist?.length > 0) && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] w-3.5 h-3.5 sm:text-[10px] sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="p-1 text-gray-600 hover:text-pink-600 transition-colors relative"
            aria-label="Shopping Cart"
          >
            <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {Boolean(user && cartCount > 0) && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[9px] w-3.5 h-3.5 sm:text-[10px] sm:w-4 sm:h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle button */}
          <button
            className="lg:hidden p-1 text-gray-700 hover:text-pink-600 transition-colors focus:outline-none"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="bg-white border-t border-b border-gray-100 py-2.5 px-3 sm:px-6 shadow-md animate-in fade-in duration-200">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 sm:py-2">
            <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search products, styles, collections..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-gray-800 placeholder-gray-400 outline-none"
              autoFocus
            />
            {searchVal && (
              <button
                type="button"
                onClick={() => setSearchVal("")}
                className="text-gray-400 hover:text-gray-600 text-xs px-1"
              >
                ✕
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchVal("");
              }}
              className="text-gray-500 hover:text-pink-600 text-xs font-semibold pl-2 border-l border-gray-200"
            >
              Close
            </button>
          </form>
        </div>
      )}

      {/* Premium Mobile Menu Slide-Over Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Slide-in Drawer Container */}
          <div className="relative w-[280px] sm:w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 overflow-y-auto transform transition-transform duration-300 ease-out">
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
                <div className="flex items-center gap-2">
                  <img
                    src="/Title_vf2_32.webp"
                    alt=""
                    aria-hidden="true"
                    width="28"
                    height="28"
                    className="w-7 h-7 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Vintage Fashion</h3>
                    <p className="text-[10px] text-gray-500">Timeless Elegance</p>
                  </div>
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Greeting / Login Banner */}
              <div className="p-4 border-b border-gray-100 bg-white">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-pink-500 text-white font-bold text-xs flex items-center justify-center">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">
                          {user.name || "Customer"}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate max-w-[140px]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setMenuOpen(false)}
                      className="text-[11px] font-semibold text-pink-600 bg-pink-50 hover:bg-pink-100 px-2.5 py-1 rounded transition-colors"
                    >
                      Account
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <p className="text-xs text-gray-600 mb-2">Welcome to Vintage Fashion</p>
                    <Link
                      to="/auth"
                      onClick={() => setMenuOpen(false)}
                      className="block w-full text-center bg-gray-900 text-white text-xs font-bold py-2 rounded uppercase tracking-wider hover:bg-pink-600 transition-colors"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="py-2 px-3 space-y-1">
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                        isActive
                          ? "bg-pink-50 text-pink-600 font-bold"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span>{link.label}</span>
                      <svg className={`w-3.5 h-3.5 ${isActive ? "text-pink-600" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>

              {/* Quick Shortcuts */}
              <div className="pt-2 px-3 border-t border-gray-100 space-y-1">
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>Wishlist</span>
                  </div>
                  {Boolean(user && wishlist?.length > 0) && (
                    <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {wishlist.length}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <span>Shopping Cart</span>
                  </div>
                  {Boolean(user && cartCount > 0) && (
                    <span className="bg-pink-100 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 text-[11px] text-gray-500 space-y-2">
              <div className="flex items-center justify-between text-gray-600 font-medium">
                <span>Currency: ₹ Rupee</span>
                <span>Language: English</span>
              </div>
              <p className="text-gray-400 text-[10px] text-center pt-1">
                © {new Date().getFullYear()} Vintage Fashion Store
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}