import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ColorRing } from "react-loader-spinner";
import { FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";
import toast from "react-hot-toast";

import { login, signup } from "../api/auth.api";
import useAuth from "../hooks/useAuth";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  avatar: null,
};

// Shared toast options: bottom-right, compact, medium-weight font
const toastOptions = {
  position: "top-center",
  style: {
    fontSize: "13px",
    fontWeight: 500,
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #fbcfe8",
  },
};

export default function AuthPage() {
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const isLogin = mode === "login";

  const getFriendlyError = (err) => {
    const message = err?.response?.data?.message || "";
    switch (message) {
      case "Email already registered":
        return "This email is already registered.";

      case "Invalid email or password":
        return "Incorrect email or password.";

      case "Network Error":
        return "No Internet Connection.";

      default:
        return "Something went wrong. Please try again.";
    }
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const updateAvatar = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setForm((current) => ({
      ...current,
      avatar: file,
    }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const createSignupPayload = () => {
    const payload = new FormData();
    payload.append("name", form.name);
    payload.append("email", form.email);
    payload.append("password", form.password);
    if (form.phone) {
      payload.append("phone", form.phone);
    }
    if (form.avatar) {
      payload.append("avatar", form.avatar);
    }
    return payload;
  };

  const saveLoggedInUser = (response) => {
    const user = response?.data?.user;
    const accessToken = response?.data?.accessToken;
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("accessToken", accessToken);
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  setLoading(true);

  try {


    const response = await login({
      email: form.email,
      password: form.password,
    });

    

    saveLoggedInUser(response);

    navigate("/account");
    toast.success("Welcome back");

  } catch (err) {

    console.log("ERROR");
    console.log(err);

  } finally {

    setLoading(false);

  }
};

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="flex flex-col items-center rounded-2xl bg-white px-10 py-8 shadow-xl">
            <ColorRing
              visible
              height={70}
              width={70}
              colors={["#ec4899", "#f472b6", "#fb7185", "#f472b6", "#ec4899"]}
            />

            <h2 className="mt-5 text-base font-semibold text-gray-800">
              {isLogin ? (
                <>Signing you <span className="text-pink-500">in</span>...</>
              ) : (
                <>Creating your <span className="text-pink-500">account</span>...</>
              )}
            </h2>

            <p className="mt-1 text-sm font-normal text-gray-500">
              Please wait while we{" "}
              <span className="font-medium text-pink-500">securely</span>{" "}
              process your request.
            </p>
          </div>
        </div>
      )}

      <main className="min-h-screen w-full bg-white-50/60 flex items-center justify-center px-5 py-10">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md rounded-2xl border border-pink-500 bg-white p-8 shadow-m"
        >
          <div className="text-center">
            <Link
              to="/"
              className="text-2xl font-semibold tracking-tight text-gray-900"
            >
              Vintage
              <span className="text-pink-500">Fashion</span>
            </Link>

            <p className="mt-3 text-sm font-normal text-gray-500">
              {isLogin ? (
                <>
                  <span className="font-medium text-pink-500">Welcome back.</span>{" "}
                  Login to continue shopping.
                </>
              ) : (
                <>
                  Create your account and start{" "}
                  <span className="font-medium text-pink-500">exploring</span> our
                  collections.
                </>
              )}
            </p>
          </div>

          <div className="mt-7 grid grid-cols-2 rounded-lg bg-pink-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                isLogin
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-md py-2.5 text-sm font-medium transition-all duration-200 ${
                !isLogin
                  ? "bg-white text-pink-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Signup
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            {!isLogin && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  required
                  placeholder="Enter your name"
                  className="mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                required
                placeholder="example@gmail.com"
                className="mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>

              <div className="relative mt-1.5">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  required
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-gray-200 px-3.5 py-2.5 pr-11 text-sm font-normal outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500"
                >
                  {showPassword ? (
                    <FaEyeSlash size={15} />
                  ) : (
                    <FaEye size={15} />
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm text-pink-500 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
              )
            }

            {!isLogin && (
              <>
                {/* Phone Number */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={updateField}
                    placeholder="9876543210"
                    className="mt-1.5 w-full rounded-lg border border-gray-200 px-3.5 py-2.5 text-sm font-normal outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
                  />
                </div>

                {/* Avatar */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Profile Picture
                  </label>

                  <div className="mt-2.5 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-pink-200 bg-pink-50">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaUserCircle size={54} className="text-pink-300" />
                      )}
                    </div>

                    <label className="cursor-pointer rounded-lg border border-pink-200 px-4 py-2 text-sm font-medium text-pink-500 transition hover:bg-pink-50">
                      Choose Image

                      <input
                        type="file"
                        accept="image/*"
                        onChange={updateAvatar}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </>
            )}

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="mt-2 w-full rounded-lg bg-pink-500 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-pink-600 disabled:opacity-60"
            >
              {loading
                ? isLogin
                  ? "Signing In..."
                  : "Creating Account..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </motion.button>
          </form>

          <div className="mt-7 border-t border-pink-100 pt-5 text-center">
            <p className="text-sm font-normal text-gray-500">
              {isLogin
                ? "Don't have an account?"
                : "Already have an account?"}
            </p>

            <button
              type="button"
              onClick={() => {
                setMode(isLogin ? "signup" : "login");
              }}
              className="mt-2 text-sm font-medium text-pink-500 transition hover:text-pink-600"
            >
              {isLogin ? "Create Account" : "Login Instead"}
            </button>
          </div>
        </motion.section>
      </main>
    </>
  );
}