import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhoneAlt,
  FaCamera,
  FaShieldAlt,
  FaCheckCircle,
  FaArrowRight,
  FaMobileAlt,
} from "react-icons/fa";
import toast from "react-hot-toast";

import { login, signup, sendOtp, sendPhoneOtp } from "../api/auth.api";
import useAuth from "../hooks/useAuth";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  avatar: null,
  otp: "",
  phoneOtp: "",
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setAccessToken } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // Email OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Mobile Phone OTP state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);
  const [phoneOtpCountdown, setPhoneOtpCountdown] = useState(0);

  const isLogin = mode === "login";

  // Resend Email OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Resend Mobile OTP countdown timer
  useEffect(() => {
    if (phoneOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setPhoneOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phoneOtpCountdown]);

  const getFriendlyError = (err) => {
    const message = err?.response?.data?.message || err?.message || "";
    const lower = message.toLowerCase();

    if (lower.includes("email already") || (lower.includes("email") && lower.includes("already registered"))) {
      return "An account with this email already exists. Please sign in instead.";
    }
    if (
      lower.includes("mobile number is already registered") ||
      lower.includes("mobile number already") ||
      (lower.includes("mobile") && lower.includes("already registered")) ||
      (lower.includes("phone") && lower.includes("already registered"))
    ) {
      return "An account with this mobile number already exists. Please sign in instead.";
    }
    if (
      lower.includes("invalid email or password") ||
      lower.includes("incorrect") ||
      lower.includes("invalid password") ||
      lower.includes("admin cannot login here") ||
      lower.includes("not allowed")
    ) {
      return "Incorrect email or password. Please try again.";
    }
    if (lower.includes("verification code") || lower.includes("otp")) {
      return message || "Invalid or expired 6-digit verification code.";
    }
    if (lower.includes("blocked")) {
      return "Your account has been suspended. Please contact customer support.";
    }
    if (lower.includes("network") || !navigator.onLine) {
      return "Unable to connect. Please check your internet connection.";
    }
    if (lower.includes("password must")) {
      return "Password must be at least 6 characters long.";
    }
    if (lower.includes("valid email")) {
      return "Please enter a valid email address (e.g. name@domain.com).";
    }
    if (lower.includes("name must")) {
      return "Please provide your full name (at least 2 characters).";
    }
    if (lower.includes("valid 10-digit") || lower.includes("valid mobile") || lower.includes("valid phone")) {
      return "Please enter a valid 10-digit mobile number (e.g. 9876543210) starting with 6, 7, 8, or 9.";
    }
    if (
      message &&
      typeof message === "string" &&
      message.length < 120 &&
      !message.includes("SQL") &&
      !message.includes("Error:") &&
      !message.includes("{")
    ) {
      return message;
    }
    return "Something went wrong while processing your request. Please try again.";
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be under 5MB.");
      return;
    }

    setForm((current) => ({
      ...current,
      avatar: file,
    }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatar = () => {
    setForm((current) => ({
      ...current,
      avatar: null,
    }));
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
  };

  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes("@")) {
      toast.error("Please enter a valid email address first.");
      return;
    }
    setSendingOtp(true);
    try {
      const res = await sendOtp({
        email: form.email.trim().toLowerCase(),
        name: form.name.trim() || undefined,
      });
      setOtpSent(true);
      setOtpCountdown(60);
      toast.success(res.message || `Verification code sent to ${form.email}`);
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setSendingOtp(false);
    }
  };

  const [demoPhoneOtp, setDemoPhoneOtp] = useState(null);

  const handleSendPhoneOtp = async () => {
    const cleanPhone = (form.phone || "").trim().replace(/\D/g, "");
    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit mobile number first (e.g. 9876543210).");
      return;
    }
    setSendingPhoneOtp(true);
    try {
      const res = await sendPhoneOtp({
        phone: cleanPhone,
        name: form.name.trim() || undefined,
        email: form.email.trim() || undefined,
      });
      setPhoneOtpSent(true);
      setPhoneOtpCountdown(60);

      if (res.previewOtp) {
        setDemoPhoneOtp(res.previewOtp);
        setForm((prev) => ({ ...prev, phoneOtp: prev.phoneOtp || res.previewOtp }));
        toast.success(
          `Verification code: ${res.previewOtp} (sent to +91 ${cleanPhone})`,
          { duration: 8000 }
        );
      } else {
        toast.success(res.message || `Verification code sent to +91 ${cleanPhone}`);
      }
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const createSignupPayload = () => {
    const payload = new FormData();
    payload.append("name", form.name.trim());
    payload.append("email", form.email.trim().toLowerCase());
    payload.append("password", form.password);
    payload.append("otp", form.otp.trim());
    if (form.phone) {
      payload.append("phone", form.phone.trim().replace(/\D/g, ""));
    }
    if (form.phoneOtp) {
      payload.append("phoneOtp", form.phoneOtp.trim());
    }
    if (form.avatar) {
      payload.append("avatar", form.avatar);
    }
    return payload;
  };

  const saveLoggedInUser = (response) => {
    const user = response.data.user;
    const accessToken = response.data.accessToken;

    setUser(user);
    setAccessToken(accessToken);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!isLogin && !form.name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!isLogin && (!otpSent || !form.otp || form.otp.trim().length !== 6)) {
      if (!otpSent) {
        handleSendOtp();
      } else {
        toast.error("Please enter the 6-digit verification code sent to your email.");
      }
      return;
    }

    if (!isLogin) {
      const cleanPhone = (form.phone || "").trim().replace(/\D/g, "");
      if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
        toast.error("Please enter a valid 10-digit mobile number (e.g. 9876543210) for courier delivery.");
        return;
      }

      if (!phoneOtpSent || !form.phoneOtp || form.phoneOtp.trim().length !== 6) {
        if (!phoneOtpSent) {
          handleSendPhoneOtp();
        } else {
          toast.error("Please enter the 6-digit verification code sent to your mobile number.");
        }
        return;
      }
    }

    setLoading(true);

    try {
      let response;

      if (isLogin) {
        response = await login({
          email: form.email.trim().toLowerCase(),
          password: form.password,
        });
      } else {
        response = await signup(createSignupPayload());
      }

      saveLoggedInUser(response);

      toast.success(
        isLogin ? "Welcome back to Vintage Fashion!" : "Account verified and created successfully! Welcome!"
      );

      const redirectTo = searchParams.get("redirect") || "/account";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30 flex items-center justify-center p-3 sm:p-6 md:p-10">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand Showcase & Editorial Visual (Hidden on mobile, 5 cols on lg) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gray-900 text-white flex-col justify-between p-10 overflow-hidden">
          {/* Ambient Background Image with Dark Vignette */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=800&auto=format&fit=crop&q=75')",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/80 to-gray-900/60 backdrop-blur-[2px]" />

          {/* Decorative Glows */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Bar */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <img
                src="/Title_vf2_32.webp"
                alt=""
                aria-hidden="true"
                width="36"
                height="36"
                className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-lg font-black tracking-tight text-white block">
                  Vintage <span className="text-pink-400">Fashion</span>
                </span>
                <span className="text-[10px] tracking-widest uppercase text-white/70 block">
                  Curated Archive Apparel
                </span>
              </div>
            </Link>
          </div>

          {/* Middle Value Props */}
          <div className="relative z-10 my-auto py-8 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-pink-500/20 border border-pink-500/30 rounded-full text-pink-300 text-xs font-bold uppercase tracking-widest mb-3">
                Member Benefits
              </span>
              <h2 className="text-2xl font-black text-white leading-tight">
                Step into Timeless Heritage Fashion
              </h2>
              <p className="mt-2 text-xs text-white/80 leading-relaxed">
                Join our community of vintage enthusiasts to unlock curated drops, exclusive archive discounts, and real-time order tracking.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400">
                  <FaCheckCircle className="w-3.5 h-3.5" />
                </div>
                <span>100% Hand-picked Authentic Vintage Garments</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400">
                  <FaCheckCircle className="w-3.5 h-3.5" />
                </div>
                <span>7-Day Easy Returns & Nationwide Fast Shipping</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-white/90">
                <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0 text-pink-400">
                  <FaCheckCircle className="w-3.5 h-3.5" />
                </div>
                <span>Seamless Wishlist & Priority Flash Sale Access</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/60">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-pink-400" />
              <span>256-Bit SSL Encrypted</span>
            </div>
            <Link to="/shop" className="text-pink-300 hover:text-white transition-colors flex items-center gap-1 font-medium">
              Explore Store <FaArrowRight className="w-2.5 h-2.5" />
            </Link>
          </div>
        </div>

        {/* Right Side: Auth Form Container (7 cols on lg) */}
        <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
          {/* Top Mobile Brand Header */}
          <div className="lg:hidden flex items-center justify-between pb-6 mb-4 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2.5">
              <img
                src="/Title_vf2_32.webp"
                alt=""
                aria-hidden="true"
                width="32"
                height="32"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <span className="text-base font-extrabold text-gray-900">
                Vintage <span className="text-pink-600">Fashion</span>
              </span>
            </Link>
            <Link to="/shop" className="text-xs font-semibold text-gray-500 hover:text-pink-600 transition-colors">
              Continue Shopping →
            </Link>
          </div>

          {/* Form Content */}
          <div className="max-w-md w-full mx-auto my-auto">
            {/* Heading & Subtitle */}
            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900">
                {isLogin ? "Welcome Back" : "Create an Account"}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-gray-500">
                {isLogin
                  ? "Enter your credentials to access your account & orders."
                  : "Sign up today to explore curated vintage & archive apparel."}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="relative bg-gray-100/80 p-1 rounded-xl mb-6 flex">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`relative flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 z-10 ${
                  isLogin ? "text-gray-900 shadow-sm bg-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`relative flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 z-10 ${
                  !isLogin ? "text-gray-900 shadow-sm bg-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Signup Profile Picture Upload */}
                  {!isLogin && (
                    <div className="flex items-center gap-4 p-3 bg-pink-50/50 rounded-xl border border-pink-100/60">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white border-2 border-pink-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                        {avatarPreview ? (
                          <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="w-6 h-6 text-pink-300" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-800">
                          Profile Photo <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="mt-1 flex items-center gap-2">
                          <label className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-semibold text-gray-700 hover:border-pink-500 hover:text-pink-600 transition-colors cursor-pointer shadow-xs">
                            <FaCamera className="w-3 h-3 text-pink-500" />
                            <span>{avatarPreview ? "Change Photo" : "Upload Photo"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={updateAvatar}
                              className="hidden"
                            />
                          </label>
                          {avatarPreview && (
                            <button
                              type="button"
                              onClick={removeAvatar}
                              className="text-[11px] text-gray-400 hover:text-red-500 transition-colors font-medium px-1"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Signup Full Name */}
                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                        Full Name <span className="text-pink-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <FaUser className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={form.name}
                          onChange={updateField}
                          required={!isLogin}
                          placeholder="e.g. Shanmukha Rao"
                          className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field with Send OTP Button */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address <span className="text-pink-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FaEnvelope className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={updateField}
                        required
                        placeholder="you@example.com"
                        className={`w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 ${!isLogin ? "pr-32" : "pr-4"} py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10`}
                      />
                      {!isLogin && (
                        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={sendingOtp || otpCountdown > 0 || !form.email.includes("@")}
                            className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm transition"
                          >
                            {sendingOtp ? (
                              <>
                                <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Sending...</span>
                              </>
                            ) : otpCountdown > 0 ? (
                              <span className="text-white/80">{otpCountdown}s</span>
                            ) : otpSent ? (
                              <span>Resend</span>
                            ) : (
                              <span>Send OTP</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* OTP Verification Input Box (Signup Mode Only) */}
                  {!isLogin && (
                    <AnimatePresence>
                      {otpSent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3.5 bg-gradient-to-br from-pink-50/70 to-rose-50/40 rounded-2xl border border-pink-200/80 shadow-xs space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                <FaShieldAlt className="text-pink-600" />
                                6-Digit Email Code <span className="text-pink-500">*</span>
                              </span>
                              <span className="text-[11px] text-gray-500">
                                {otpCountdown > 0 ? (
                                  <span className="text-pink-600 font-semibold">Resend in {otpCountdown}s</span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleSendOtp}
                                    disabled={sendingOtp}
                                    className="font-bold text-pink-600 hover:underline"
                                  >
                                    Resend Code
                                  </button>
                                )}
                              </span>
                            </div>

                            <div className="relative">
                              <input
                                type="text"
                                inputMode="numeric"
                                name="otp"
                                maxLength={6}
                                value={form.otp}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                  setForm((prev) => ({ ...prev, otp: val }));
                                }}
                                placeholder="0 0 0 0 0 0"
                                className="w-full bg-white border border-pink-300 rounded-xl px-4 py-2.5 sm:py-3 text-center text-base sm:text-lg font-mono font-bold tracking-[0.35em] text-gray-900 placeholder:text-gray-300 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15"
                              />
                              {form.otp.length === 6 && (
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                                  <FaCheckCircle className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            <p className="text-[11px] text-gray-500 leading-tight">
                              We sent a verification code to <span className="font-bold text-gray-700">{form.email}</span>. Please check your inbox or promotions tab.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Signup Phone Number with Send OTP Button */}
                  {!isLogin && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                          Mobile Number <span className="text-pink-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 gap-1.5 z-10">
                            <FaPhoneAlt className="w-3.5 h-3.5 text-pink-600/70" />
                            <span className="text-xs font-semibold text-gray-500 border-r border-gray-200 pr-1.5">+91</span>
                          </div>
                          <input
                            type="tel"
                            name="phone"
                            maxLength={10}
                            value={form.phone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "");
                              setForm((prev) => ({ ...prev, phone: val }));
                            }}
                            required={!isLogin}
                            placeholder="9876543210"
                            className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-16 pr-32 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10 tracking-wider"
                          />
                          <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
                            <button
                              type="button"
                              onClick={handleSendPhoneOtp}
                              disabled={sendingPhoneOtp || phoneOtpCountdown > 0 || (form.phone || "").replace(/\D/g, "").length !== 10}
                              className="bg-gray-900 hover:bg-pink-600 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                              {sendingPhoneOtp ? (
                                <>
                                  <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span>Sending...</span>
                                </>
                              ) : phoneOtpCountdown > 0 ? (
                                <span className="text-white/80">{phoneOtpCountdown}s</span>
                              ) : phoneOtpSent ? (
                                <span>Resend</span>
                              ) : (
                                <span>Send OTP</span>
                              )}
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Required for courier delivery calls, mobile verification, & live tracking
                        </p>
                      </div>

                      {/* Mobile OTP Verification Input Box (Signup Mode Only) */}
                      <AnimatePresence>
                        {phoneOtpSent && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 via-pink-50/50 to-rose-50/40 rounded-2xl border border-indigo-200/80 shadow-xs space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                  <FaMobileAlt className="text-indigo-600" />
                                  6-Digit Mobile SMS Code <span className="text-pink-500">*</span>
                                </span>
                                <span className="text-[11px] text-gray-500">
                                  {phoneOtpCountdown > 0 ? (
                                    <span className="text-indigo-600 font-semibold">Resend in {phoneOtpCountdown}s</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleSendPhoneOtp}
                                      disabled={sendingPhoneOtp}
                                      className="font-bold text-indigo-600 hover:underline cursor-pointer"
                                    >
                                      Resend Code
                                    </button>
                                  )}
                                </span>
                              </div>

                              <div className="relative">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  name="phoneOtp"
                                  maxLength={6}
                                  value={form.phoneOtp}
                                  onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setForm((prev) => ({ ...prev, phoneOtp: val }));
                                  }}
                                  placeholder="0 0 0 0 0 0"
                                  className="w-full bg-white border border-indigo-300 rounded-xl px-4 py-2.5 sm:py-3 text-center text-base sm:text-lg font-mono font-bold tracking-[0.35em] text-gray-900 placeholder:text-gray-300 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15"
                                />
                                {form.phoneOtp.length === 6 && (
                                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                                    <FaCheckCircle className="w-5 h-5" />
                                  </div>
                                )}
                              </div>

                              <p className="text-[11px] text-gray-500 leading-tight">
                                We sent a 6-digit code to <span className="font-bold text-gray-700">+91 {form.phone}</span>. Please check your SMS messages{form.email ? ` or email at ${form.email}` : ""}.
                              </p>

                              {demoPhoneOtp && (
                                <div className="flex items-center justify-between bg-white/95 border border-indigo-200 rounded-xl px-3 py-2 text-[11px] shadow-xs">
                                  <span className="text-gray-600 font-medium">
                                    Demo Code: <strong className="font-mono text-indigo-700 font-bold tracking-widest text-xs">{demoPhoneOtp}</strong>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setForm((prev) => ({ ...prev, phoneOtp: demoPhoneOtp }))}
                                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-2 py-1 rounded-md transition cursor-pointer"
                                  >
                                    Auto-fill Code
                                  </button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Password Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                        Password <span className="text-pink-500">*</span>
                      </label>
                      {isLogin && (
                        <Link
                          to="/forgot-password"
                          className="text-xs font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <FaLock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={updateField}
                        required
                        placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                        className="w-full bg-gray-50/60 border border-gray-200 rounded-xl pl-10 pr-11 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:bg-white focus:border-pink-500 focus:ring-3 focus:ring-pink-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gray-900 hover:bg-pink-600 text-white text-xs sm:text-sm font-bold uppercase tracking-widest py-3 sm:py-3.5 rounded-xl shadow-lg hover:shadow-pink-500/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
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
                    <span>{isLogin ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In to Account" : "Create My Account"}</span>
                    <FaArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Switch Text */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                {isLogin ? "New to Vintage Fashion?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setMode(isLogin ? "signup" : "login")}
                  className="font-bold text-pink-600 hover:text-pink-700 hover:underline transition-colors cursor-pointer"
                >
                  {isLogin ? "Create an account" : "Sign in here"}
                </button>
              </p>
            </div>
          </div>

          {/* Legal and Terms Footer */}
          <div className="pt-6 mt-6 border-t border-gray-100 text-center text-[11px] text-gray-400">
            By continuing, you agree to Vintage Fashion's{" "}
            <Link to="/terms" className="text-gray-600 hover:text-pink-600 underline">
              Terms & Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
}