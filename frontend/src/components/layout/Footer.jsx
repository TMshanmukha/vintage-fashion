import { Link } from "react-router-dom";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="text-2xl font-extrabold tracking-tight text-gray-900 block mb-3">
              Vintage Fashion
            </Link>
            <p className="text-xs text-gray-400">© 2026 Svs.<br />All Rights Reserved</p>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">About Us</h4>
            <ul className="space-y-2">
              {["About us", "Store location", "Contact", "Orders tracking"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Useful Links</h4>
            <ul className="space-y-2">
              {["Returns", "Support Policy", "Size guide", "FAQs"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow + Subscribe */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Follow Us</h4>
            <ul className="space-y-2 mb-8">
              {["Facebook", "Twitter", "Instagram", "Youtube"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
            {/* <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">Subscribe</h4>
            <p className="text-xs text-gray-400 mb-3">Get E-mail updates about our latest shop and special offers.</p>
            {/* <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email here..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-b border-gray-300 text-xs py-1.5 outline-none focus:border-pink-500 transition-colors bg-transparent"
              />
              <button className="text-xs font-bold uppercase tracking-widest underline text-gray-900 hover:text-pink-500 transition-colors text-left">
                Subscribe
              </button>
            </div> */} 
          </div>
        </div>
      </div>
    </footer>
  );
}
