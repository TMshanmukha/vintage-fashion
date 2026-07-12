import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    try {
      const response = await forgotPassword(email);

      console.log(response);

      setSuccess(
        "If the email exists, a password reset link has been sent."
      );
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-lg p-8">

        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Forgot Password
          </h1>

          <p className="mt-3 text-sm text-gray-500 leading-6">
            Enter the email address associated with your account.
            <br />
            We'll send you a password reset link.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5"
        >
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="example@gmail.com"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-pink-500 py-3 font-semibold text-white transition hover:bg-pink-600 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Please enter your registered email address.
          <br />
          If an account exists, a password reset link will be sent automatically.
        </p>

        {success && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 text-center">
            {success}
          </div>
        )}

        <div className="mt-7 text-center">
          <Link
            to="/auth"
            className="text-sm font-semibold text-pink-500 hover:text-pink-600"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}