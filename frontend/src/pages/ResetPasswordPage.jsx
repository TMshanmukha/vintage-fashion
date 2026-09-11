import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";
import { resetPassword } from "../api/auth.api";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or expired password reset link.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    try {
      setLoading(true);

      const response = await resetPassword({
        token,
        password,
      });

      toast.success(response.message || "Password updated successfully!");
      navigate("/auth");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to reset password. Please try again."
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
            Create New Password
          </h1>

          <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
            Please choose a strong, secure password with at least 6 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaLock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                required
                className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-11 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaLock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Repeat new password"
                required
                className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gray-900 hover:bg-pink-600 text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
                <span>Updating password...</span>
              </>
            ) : (
              <span>Reset & Sign In</span>
            )}
          </button>
        </form>

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