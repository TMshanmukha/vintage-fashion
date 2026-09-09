import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";

const navLinks = [
  { label: "Home", path: "/", hasDropdown: true },
  { label: "Shop", path: "/shop", hasDropdown: true },
  { label: "Collection", path: "/collection" },
  //{ label: "Pages", path: "#", hasDropdown: true },
  //{ label: "Blog", path: "/blog", hasDropdown: true },
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setSearchVal("");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
          <img
            src="/Title_vf2.png"
            alt="Vintage Fashion"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0 shadow-sm"
          />

          <span className="text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-gray-900 truncate">
            Vintage Fashion
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <div key={link.label} className="relative group">
              <Link
                to={link.path}
                className={`text-sm font-medium flex items-center gap-1 transition-colors hover:text-pink-500 ${location.pathname === link.path ? "text-pink-500" : "text-gray-700"
                  }`}
              >
                {link.label}
                {link.hasDropdown && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-gray-600 hover:text-pink-500 transition-colors"
            aria-label="Toggle search bar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <Link
            to={user ? "/account" : "/auth"}
            aria-label="Open login or registration page"
            className="text-gray-600 hover:text-pink-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          <Link to="/wishlist" className="text-gray-600 hover:text-pink-500 transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {Boolean(user && wishlist?.length > 0) && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link to="/cart" className="text-gray-600 hover:text-pink-500 transition-colors relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {Boolean(user && cartCount > 0) && (
              <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button className="lg:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="bg-white border-t border-b border-gray-100 py-3 px-4 sm:px-6 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="Search products, brands, or categories..."
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
              className="text-gray-500 hover:text-pink-600 text-xs sm:text-sm font-semibold pl-2 border-l border-gray-200"
            >
              Close
            </button>
          </form>
        </div>
      )}

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-sm font-medium text-gray-700 hover:text-pink-500"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}