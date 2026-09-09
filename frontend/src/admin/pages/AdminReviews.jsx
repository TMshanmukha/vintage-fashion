import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminLayout from "../components/AdminLayout";
import AdminTopbar from "../components/AdminTopbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { getAdminReviews, deleteAdminReview } from "../../api/reviewApi";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getAdminReviews();
      setReviews(res.data?.reviews || res.data || []);
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to fetch customer reviews.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteAdminReview(deleteTarget.review_id);
      setReviews((prev) => prev.filter((r) => r.review_id !== deleteTarget.review_id));
      toast.success("Review deleted successfully.");
      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete review:", err);
      toast.error(err.response?.data?.message || "Failed to delete review.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      !search.trim() ||
      r.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase());

    const matchesRating =
      ratingFilter === "all" || Number(r.rating) === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  const totalReviews = reviews.length;
  const avgRating = totalReviews
    ? (reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0) / totalReviews).toFixed(1)
    : "0.0";
  const fiveStars = reviews.filter((r) => Number(r.rating) === 5).length;
  const lowRatings = reviews.filter((r) => Number(r.rating) <= 2).length;

  return (
    <AdminLayout>
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        <AdminTopbar
          title="Product Reviews"
          description="Moderate customer ratings and delete inappropriate or spam reviews"
        />

        <div className="p-6 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Total Reviews</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalReviews}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Average Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-amber-500">{avgRating}</span>
                <span className="text-amber-400">★</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">5-Star Ratings</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{fiveStars}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Low Ratings (≤2★)</p>
              <p className="text-2xl font-bold text-red-500 mt-1">{lowRatings}</p>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <svg
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews, products, users..."
                className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-gray-900 bg-gray-50/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">Filter Rating:</span>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-gray-900"
              >
                <option value="all">All Ratings</option>
                <option value="5">5 Stars (★★★★★)</option>
                <option value="4">4 Stars (★★★★)</option>
                <option value="3">3 Stars (★★★)</option>
                <option value="2">2 Stars (★★)</option>
                <option value="1">1 Star (★)</option>
              </select>
            </div>
          </div>

          {/* Reviews Table / List */}
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading reviews...</div>
            ) : filteredReviews.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                <p className="text-sm font-medium text-gray-600">No reviews found</p>
                <p className="text-xs mt-1">No customer reviews match your search or filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Product</th>
                      <th className="py-3.5 px-4">Customer</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Review Content</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReviews.map((r) => (
                      <tr key={r.review_id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-gray-900 max-w-[180px]">
                          <div className="flex items-center gap-3">
                            {r.product_image && (
                              <img
                                src={r.product_image}
                                alt={r.product_name}
                                className="w-10 h-10 object-cover rounded-md border border-gray-100 flex-shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-gray-900 truncate" title={r.product_name}>
                                {r.product_name || `Product #${r.product_id}`}
                              </p>
                              <p className="text-[10px] text-gray-400">ID: {r.product_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                              {(r.user_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{r.user_name || "Customer"}</p>
                              {r.user_email && <p className="text-[10px] text-gray-400">{r.user_email}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={s <= r.rating ? "text-amber-400" : "text-gray-200"}>
                                ★
                              </span>
                            ))}
                            <span className="ml-1.5 font-bold text-gray-700">{r.rating}/5</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 max-w-sm">
                          {r.title && (
                            <p className="font-semibold text-gray-900 mb-0.5">{r.title}</p>
                          )}
                          <p className="text-gray-600 line-clamp-2 leading-relaxed">{r.comment}</p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap text-gray-400">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setDeleteTarget(r)}
                            disabled={deleting}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete Review"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Customer Review?"
        message={`Are you sure you want to permanently delete this ${deleteTarget?.rating}-star review by "${deleteTarget?.user_name || "Customer"}" on "${deleteTarget?.product_name || "this product"}"? This will update the product's overall rating immediately.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
