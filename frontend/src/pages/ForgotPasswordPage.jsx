import { useState } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaArrowLeft, FaCheckCircle, FaLock } from "react-icons/fa";
import toast from "react-hot-toast";
import { forgotPassword } from "../api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email.trim().toLowerCase());
      setSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to send reset email. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 sm:p-10">
        <div className="text-center">
          <div className="w-14 h-14 bg-pink-50 rounded-2xl border border-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
            <FaLock className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
            Forgot Password?
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            No worries! Enter your registered email address and we'll send you a password recovery link.
          </p>
        </div>

        {submitted ? (
          <div className="mt-8 p-6 bg-green-50 border border-green-200/80 rounded-2xl text-center space-y-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <FaCheckCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-green-900">Check Your Inbox</h3>
            <p className="text-xs text-green-700 leading-relaxed">
              If an account with <strong>{email}</strong> exists, a password reset link has been dispatched.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail("");
              }}
              className="text-xs font-bold text-green-800 hover:text-green-900 underline pt-2 block mx-auto cursor-pointer"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Registered Email
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FaEnvelope className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoFocus
                  className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-pink-600 text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Sending instructions...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-pink-600 transition-colors"
          >
            <FaArrowLeft className="w-3 h-3" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </main>
  );
}