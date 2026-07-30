import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {

    const navigate = useNavigate();
    const { login } = useAdminAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const response = await axios.post(
                // Was hardcoded to localhost:5000 — that only ever worked
                // in dev. In production the visitor's browser tried to hit
                // localhost:5000 on THEIR machine, not your server, which
                // is what produced the CORS/loopback error.
                "https://vintage-fashion.onrender.com/api/auth/admin/login",
                formData,
                {
                    withCredentials: true
                }
            );

            const { user, accessToken } = response.data.data;

            if (!user || user.role !== "admin") {

                toast.error("You are not authorized to access the admin panel.");

                setLoading(false);

                return;
            }

            login(user, accessToken);

            toast.success("Welcome Admin 👋");

            navigate("/admin/dashboard");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Login failed."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen bg-slate-950 relative overflow-hidden">

            {/* Background */}

            <div className="absolute inset-0">

                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#4338ca25,transparent_40%)]" />

                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#2563eb20,transparent_40%)]" />

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:35px_35px]" />

            </div>

            <div className="relative flex items-center justify-center min-h-screen px-5">

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 30
                    }}
                    animate={{
                        opacity: 1,
                        y: 0
                    }}
                    transition={{
                        duration: 0.5
                    }}
                    className="w-full max-w-md"
                >

                    {/* Logo */}

                    <div className="flex flex-col items-center mb-8">

                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-2xl">

                            <ShieldCheck className="w-10 h-10 text-white" />

                        </div>

                        <h1 className="text-white text-3xl font-bold mt-6">
                            Vintage Fashion
                        </h1>

                        <p className="text-slate-400 mt-2 text-sm">
                            Administrator Control Panel
                        </p>

                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8">
                      <form
    onSubmit={handleSubmit}
    className="space-y-6"
>

    {/* Email */}

    <div>

        <label className="block text-sm font-medium text-slate-300 mb-2">
            Email Address
        </label>

        <div className="relative">

            <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                required
                className="w-full h-12 rounded-xl bg-slate-900/70 border border-slate-700 text-white pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
            />

        </div>

    </div>

    {/* Password */}

    <div>

        <label className="block text-sm font-medium text-slate-300 mb-2">
            Password
        </label>

        <div className="relative">

            <Lock
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full h-12 rounded-xl bg-slate-900/70 border border-slate-700 text-white pl-12 pr-12 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition"
            />

            <button
                type="button"
                onClick={() =>
                    setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
            >

                {showPassword ? (
                    <EyeOff size={18} />
                ) : (
                    <Eye size={18} />
                )}

            </button>

        </div>

    </div>

    {/* Login Button */}

    <motion.button
        whileHover={{
            scale: 1.02
        }}
        whileTap={{
            scale: 0.98
        }}
        disabled={loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-indigo-600/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
    >

        {loading ? (
            <div className="flex items-center justify-center gap-2">

                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                Signing In...

            </div>
        ) : (
            "Sign In to Dashboard"
        )}

    </motion.button>

</form>

      <div className="mt-8 border-t border-slate-800 pt-6">

          <p className="text-center text-xs text-slate-500">
            Vintage Fashion Admin Portal
          </p>

          <p className="text-center text-xs text-slate-600 mt-1">
            Secure access for authorized administrators only.
          </p>

      </div>

      </div>

      </motion.div>

      </div>

    </div>
  );
}