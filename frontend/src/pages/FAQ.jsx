import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Orders & Shipping",
    q: "How long will it take for my order to arrive?",
    a: "Orders are processed within 24 to 48 hours. Standard domestic delivery typically takes 3 to 6 business days depending on your delivery location. You will receive live tracking updates via email once your order is dispatched.",
  },
  {
    category: "Orders & Shipping",
    q: "Do you offer free shipping?",
    a: "Yes! We offer free shipping on eligible orders meeting the store's promotional threshold displayed on the announcement banner. Any applicable standard delivery fee is transparently calculated and displayed at checkout before you place your order.",
  },
  {
    category: "Orders & Shipping",
    q: "How can I track my order status?",
    a: "Once logged in, navigate to 'My Account' -> 'Order History'. You can click on any order to see its live shipping status, tracking ID, and delivery milestones.",
  },
  {
    category: "Orders & Shipping",
    q: "Can I cancel my order after placing it?",
    a: "Yes! You can cancel your order directly from your 'My Account' page before the order has been dispatched. Once canceled, any prepaid amount is automatically refunded.",
  },
  {
    category: "Returns & Refunds",
    q: "What is your return policy?",
    a: "We offer a 7-day hassle-free return and exchange policy on all eligible garments. Products must be unworn, unwashed, and have their original tags intact.",
  },
  {
    category: "Returns & Refunds",
    q: "How do I request a return or exchange?",
    a: "Go to 'My Account' -> 'Orders', select the item you wish to return, and click 'Request Return'. You can specify whether you'd like a refund or a replacement size/color.",
  },
  {
    category: "Returns & Refunds",
    q: "How long does it take to receive my refund?",
    a: "All approved refunds are directly credited back to your original payment source (UPI account, Debit/Credit Card, or NetBanking) within 3 to 5 business days via our secure payment gateway.",
  },
  {
    category: "Payments & Offers",
    q: "What payment methods do you accept?",
    a: "We accept 100% safe and secure online payments processed through Razorpay, including UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, MasterCard, RuPay), and NetBanking from all major banks.",
  },
  {
    category: "Payments & Offers",
    q: "How do I apply a discount coupon?",
    a: "You can enter your promotional coupon code during the Checkout process in the 'Apply Coupon' box to instantly receive your discount before payment.",
  },
  {
    category: "Product & Care",
    q: "How do I determine the right size for me?",
    a: "We provide exact garment measurements on each product page as well as on our dedicated Size Guide page. We recommend measuring your chest, waist, and hips to compare with the size chart.",
  },
  {
    category: "Product & Care",
    q: "How should I wash and care for vintage clothing?",
    a: "We recommend gentle machine washing with mild detergent or hand washing in cold water to preserve fabric colors and delicate stitching. Always air dry in shade.",
  },
  {
    category: "Account & Security",
    q: "Do I need an account to place an order?",
    a: "You can browse products and add items to your cart freely. To complete checkout and ensure secure order tracking, you will need to sign in or create an account.",
  },
  {
    category: "Account & Security",
    q: "Is my payment information safe and secure?",
    a: "Absolutely. We use industry-standard 256-bit SSL encryption and process all electronic payments through RBI-compliant, PCI-DSS certified gateways (Razorpay).",
  },
];

const categories = ["All", "Orders & Shipping", "Returns & Refunds", "Payments & Offers", "Product & Care", "Account & Security"];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [openIndex, setOpenIndex] = useState(0);

  const filteredFaqs = faqs.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Frequently Asked Questions</span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full mb-3">
          Help & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          Find fast answers to common questions about orders, shipping, returns, sizing, and payments.
        </p>

        {/* Live FAQ Search */}
        <div className="relative mt-6 max-w-lg mx-auto">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-900 shadow-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar justify-start sm:justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 text-xs font-semibold rounded-full whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-gray-900 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQs List Accordion */}
      <div className="space-y-3 mb-14">
        {filteredFaqs.length === 0 ? (
          <div className="p-10 text-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-xs">
            No matching questions found for "{searchQuery}". Please try another search term or contact support.
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {faq.q}
                  </span>
                  <span className={`text-gray-400 transform transition-transform duration-200 ${isOpen ? "rotate-180 text-pink-600" : ""}`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-50 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still Need Help Contact Card */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 rounded-2xl text-center space-y-4 shadow-lg">
        <h3 className="text-lg font-bold">Still have questions?</h3>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Can't find what you're looking for? Our dedicated customer care team is here to assist you from Monday to Saturday, 9 AM – 6 PM.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            to="/contact"
            className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-sm"
          >
            Contact Support
          </Link>
          <a
            href="tel:9999999999"
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
          >
            Call Us: 99999-99999
          </a>
        </div>
      </div>
    </div>
  );
}
