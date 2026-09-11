import { Link } from "react-router-dom";
import { FaShieldAlt, FaUserLock, FaCreditCard, FaTruck, FaUndo, FaCheck } from "react-icons/fa";

export default function TermsPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
        <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Terms of Service & Privacy Policy</span>
      </div>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-pink-600 bg-pink-50 border border-pink-100 px-3.5 py-1 rounded-full mb-3">
          Legal & Privacy Framework
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Terms & Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mt-3 leading-relaxed">
          Welcome to Vintage Fashion. Your trust, privacy, and satisfaction are at the core of our business. Please review our comprehensive service terms and data privacy guarantees.
        </p>
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-xs">
            <FaShieldAlt className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">256-Bit SSL Protection</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All user sessions and transactions are fully encrypted with modern industry protocols.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-xs">
            <FaUserLock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">Zero Third-Party Selling</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            We never sell, rent, or trade your personal information or contact details to third parties.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg shadow-xs">
            <FaUndo className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1.5">7-Day Return Guarantee</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Transparent exchange and return processes for all eligible vintage orders.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 space-y-10 shadow-sm">
        {/* Section 1 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            1. Terms of Service & Account Usage
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              By accessing, browsing, or registering an account on Vintage Fashion (accessible at vintage-fashion-xi.vercel.app), you agree to comply with and be bound by these Terms of Service.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>You must be at least 18 years old or browsing with the consent of a parent or guardian.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials and password.</li>
              <li>Vintage Fashion reserves the right to suspend or terminate accounts that engage in fraudulent behavior or unauthorized access.</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 2 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            2. Privacy Policy & Data Security
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              We collect only the essential personal details necessary to fulfill your orders, process payments, and improve your shopping experience:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Personal Information:</strong> Name, shipping address, phone number, and email address for order fulfillment and delivery notifications.</li>
              <li><strong>Payment Information:</strong> All online payments are securely processed by Razorpay using end-to-end PCI-DSS compliant encryption. We never store credit card or debit card numbers on our servers.</li>
              <li><strong>Cookies & Session Data:</strong> We utilize essential browser cookies to maintain your shopping cart, wishlist, and active login sessions.</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 3 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            3. Vintage Authenticity & Product Conditions
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              Vintage Fashion specializes in curated, authentic archive garments. Due to the historical nature of vintage apparel:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Minor variations in fabric wash, patina, or distressing are intrinsic characteristics of genuine vintage pieces.</li>
              <li>All garments undergo stringent multi-point inspection, grading, and professional sanitization before cataloging.</li>
              <li>Exact measurements and fit guides are provided on every product page to ensure sizing accuracy.</li>
            </ul>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Section 4 */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            4. Shipping, Deliveries & Returns
          </h2>
          <div className="space-y-3 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <p>
              Orders are typically dispatched within 24–48 business hours via trusted logistics partners (Shiprocket, BlueDart, Delhivery).
            </p>
            <p>
              For detailed instructions on initiating a return, door-step courier pickup, or size exchange within 7 days of delivery, please refer to our dedicated{" "}
              <Link to="/returns" className="font-semibold text-pink-600 hover:underline">
                Returns & Exchanges Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Action Footers */}
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Last Updated: September 2026 · Vintage Fashion Inc.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="text-xs font-bold text-gray-700 hover:text-pink-600 transition-colors"
            >
              Contact Support
            </Link>
            <Link
              to="/returns"
              className="text-xs font-bold text-gray-700 hover:text-pink-600 transition-colors"
            >
              Returns Policy
            </Link>
            <Link
              to="/shop"
              className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-pink-600 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
