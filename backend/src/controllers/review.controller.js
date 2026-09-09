import {
  getReviewsByProduct,
  getReviewsSummary,
  createReview,
  deleteReviewById,
  getAllReviewsForAdmin,
} from "../models/review.model.js";
import { findUserById } from "../models/user.model.js";

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required." });
    }

    const [reviews, summary] = await Promise.all([
      getReviewsByProduct(productId),
      getReviewsSummary(productId),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        summary,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user?.userId || req.user?.id || req.user?.user_id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Please log in to submit a review." });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please provide a rating between 1 and 5 stars." });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: "Please write a review comment." });
    }

    // Fetch user name
    const user = await findUserById(userId);
    const userName = user?.name || "Verified Customer";

    const result = await createReview({
      productId: Number(productId),
      userId: Number(userId),
      userName,
      rating: Number(rating),
      title: title?.trim() || "",
      comment: comment.trim(),
    });

    const summary = await getReviewsSummary(productId);

    return res.status(201).json({
      success: true,
      message: "Your review has been submitted successfully!",
      data: {
        review_id: result.insertId,
        product_id: Number(productId),
        user_id: Number(userId),
        user_name: userName,
        rating: Number(rating),
        title: title?.trim() || "",
        comment: comment.trim(),
        created_at: new Date().toISOString(),
        summary,
      },
    });
  } catch (err) {
    console.error("Review creation error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to submit your review right now. Please try again in a moment.",
    });
  }
};

export const adminListReviews = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 50 } = req.query;
    const data = await getAllReviewsForAdmin({ search, page, limit });
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const adminDeleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    if (!reviewId) {
      return res.status(400).json({ success: false, message: "Review ID is required." });
    }

    await deleteReviewById(reviewId);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};
