import { Link } from "react-router-dom";
import SectionTitle from "../components/ui/SectionTitle";

export default function ReturnsPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
        <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Returns & Exchanges Policy</span>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-pink-600 bg-pink-50 px-3 py-1 rounded-full mb-3">
          Hassle-Free & Transparent
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
          Returns & Exchanges
        </h1>
        <p className="text-sm text-gray-500 mt-3 leading-relaxed">
          At Vintage Fashion, we want you to love everything you wear. If something isn't quite right, we're here to help make it right with our 7-day hassle-free return and exchange policy.
        </p>
      </div>

      {/* 3 Step Process */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            1
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Request Online</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Go to your Account orders list and click "Request Return" on any eligible item within 7 days of delivery.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            2
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Doorstep Pickup</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Our courier partner will pick up the package directly from your delivery address at no extra cost to you.
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
            3
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">Quick Refund</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Once inspected at our warehouse, your full refund will be processed to your original payment method within 3–5 business days.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 space-y-8 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Eligible Conditions for Returns</h3>
          <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
            <li>Items must be unworn, unwashed, and in their original vintage condition.</li>
            <li>All original brand tags, labels, and packaging must remain intact and attached.</li>
            <li>Return request must be initiated within <strong>7 calendar days</strong> from the delivery timestamp.</li>
            <li>Items marked as "Final Clearance Sale" or customized garments are not eligible for return.</li>
          </ul>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Exchange Options</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-3">
            Need a different size or color? We offer instant size and color exchanges subject to stock availability. Simply specify your preferred replacement size when submitting your return request.
          </p>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="text-base font-bold text-gray-900 mb-2">Refund Processing & Timelines</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2">
            - <strong>Direct Source Refund:</strong> Once the returned item passes our warehouse quality inspection, the full refund is automatically credited back to your original payment source (UPI account / Card / NetBanking) via Razorpay within 3–5 business days.
          </p>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            - <strong>Instant Status Updates:</strong> You will receive real-time email notifications with your refund reference ID once the payout is processed.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/account"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-pink-600 transition-colors shadow-sm"
          >
            Go to My Orders to Return
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-gray-200 transition-colors"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
}
