import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../api/auth.api";

export default function ResetPasswordPage() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (password !== confirmPassword) {

            toast.error("Passwords do not match");

            return;

        }

        try {

            setLoading(true);

            const response = await resetPassword({
                token,
                password
            });

            toast.success(response.message);

            navigate("/auth");

        } catch (error) {

            toast.error(
                error.response?.data?.message ||
                "Unable to reset password"
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="min-h-screen flex justify-center items-center">

            <form
                onSubmit={handleSubmit}
                className="w-[420px] rounded-xl shadow-lg border p-8 space-y-5"
            >

                <h1 className="text-2xl font-bold">
                    Reset Password
                </h1>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border rounded-lg p-3"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full border rounded-lg p-3"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                />

                <button
                    className="w-full bg-pink-500 text-white rounded-lg p-3"
                    disabled={loading}
                >
                    {
                        loading
                        ?
                        "Updating..."
                        :
                        "Reset Password"
                    }

                </button>

            </form>

        </div>

    );

}