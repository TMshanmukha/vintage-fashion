import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMapMarkerAlt } from "react-icons/fa";

// TODO: swap these for your real social page URLs whenever you have them
const FACEBOOK_URL = "https://facebook.com/vintagefashion";
const TWITTER_URL = "https://twitter.com/vintagefashion";
const INSTAGRAM_URL = "https://instagram.com/vintagefashion";
const YOUTUBE_URL = "https://youtube.com/@vintagefashion";

// Opens Google Maps directly on the store's location — no API key needed
const STORE_MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Anantapur+Old+Town+Boya+Vedi+Street+shop+Vintage";

const socialLinks = [
  { name: "Facebook", url: FACEBOOK_URL, Icon: FaFacebookF },
  { name: "Twitter", url: TWITTER_URL, Icon: FaTwitter },
  { name: "Instagram", url: INSTAGRAM_URL, Icon: FaInstagram },
  { name: "Youtube", url: YOUTUBE_URL, Icon: FaYoutube },
];

export default function Footer() {
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
              <li>
                <Link to="/about" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <a
                  href={STORE_MAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-pink-500 transition-colors"
                >
                  <FaMapMarkerAlt className="w-3.5 h-3.5" />
                  Store location
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/account" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
                  Order tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Useful Links</h4>
            <ul className="space-y-2">
              {["Returns", "Size guide", "FAQs"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Follow Us</h4>
            <div className="flex items-center gap-3">
              {socialLinks.map(({ name, url, Icon }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-pink-500 hover:bg-pink-500 hover:text-white transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-xs text-gray-400">
            Crafted with care for timeless style.
          </p>
        </div>
      </div>
    </footer>
  );
}