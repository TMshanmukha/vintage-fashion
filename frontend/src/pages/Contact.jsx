import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { submitContactForm } from "../api/contactApi";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitContactForm(form);
      setSent(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Couldn't send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gray-100 py-20 text-center">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1400&h=300&fit=crop" alt="" className="w-full h-full object-cover opacity-40" />
        </div>
        <div className="relative">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Contact Us</h1>
          <nav className="text-xs text-gray-500">
            <Link to="/" className="hover:text-pink-500">Home</Link>
            <span className="mx-2">/</span>
            <span>Contact</span>
          </nav>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-10">
              Have a question about an order, product, or anything else? We're here to help. Fill out the form and we'll get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />,
                  title: "Visit Us",
                  desc: "Boya Veedhi, Old Town, Anantapur, Andhra Pradesh - 515001",
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />,
                  title: "Call Us",
                  desc: "+91 99999 99999",
                },
                {
                  icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                  title: "Email Us",
                  desc: "support@vintagefashion.in",
                },
              ].map(({ icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {icon}
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-0.5">{title}</h3>
                    <p className="text-sm text-gray-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4">Store Hours</h3>
              <div className="space-y-2 text-sm">
                {[["Mon – Fri", "9:00 AM – 8:00 PM"], ["Saturday & Sunday", "10:00 AM – 6:00 PM"]].map(([day, hours]) => (
                  <div key={day} className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">{day}</span>
                    <span className="font-medium text-gray-700">{hours}</span>
                  </div>
                ))}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 mt-4">But, you can order anytime online.</h3>
            </div>
          </div>

          {/* Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
            {sent && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6">
                ✓ Your message has been sent. We'll be in touch soon!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[["name", "Your Name", "text"], ["email", "Email Address", "email"]].map(([name, placeholder, type]) => (
                  <div key={name}>
                    <input
                      name={name}
                      type={type}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                      required
                      disabled={submitting}
                      className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors placeholder:text-gray-400 disabled:opacity-60"
                    />
                  </div>
                ))}
              </div>
              <input
                name="subject"
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                disabled={submitting}
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors placeholder:text-gray-400 disabled:opacity-60"
              />
              <textarea
                name="message"
                rows={6}
                placeholder="Your message..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                disabled={submitting}
                className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors placeholder:text-gray-400 resize-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gray-900 text-white text-xs font-bold uppercase tracking-widest py-4 hover:bg-pink-500 transition-colors disabled:opacity-60"
              >
                {submitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}