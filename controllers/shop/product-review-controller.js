const mongoose = require("mongoose");
const Order = require("../../models/Order");
const Product = require("../../models/Product");
const ProductReview = require("../../models/Review");

const addProductReview = async (req, res) => {
  try {
    const { productId, userId, userName, reviewMessage, reviewValue } = req.body;

    // ✅ Minimal validation to prevent crashes / bad data
    const rating = Number(reviewValue);
    if (
      !productId ||
      !userId ||
      !userName ||
      !reviewMessage ||
      !Number.isFinite(rating) ||
      rating <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Error",
      });
    }

    // ✅ Prevent CastError noise for invalid ObjectIds (if these are ObjectIds in DB)
    const isValidProductId = mongoose.Types.ObjectId.isValid(productId);
    if (!isValidProductId) {
      return res.status(400).json({
        success: false,
        message: "Error",
      });
    }

    // ✅ Ensure the product exists (safe)
    const productExists = await Product.findById(productId).select("_id");
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Error",
      });
    }

    const order = await Order.findOne({
      userId,
      "cartItems.productId": productId,
      // orderStatus: "confirmed" || "delivered",
    }).select("_id");

    if (!order) {
      return res.status(403).json({
        success: false,
        message: "You need to purchase product to review it.",
      });
    }

    const checkExistinfReview = await ProductReview.findOne({
      productId,
      userId,
    }).select("_id");

    if (checkExistinfReview) {
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product!",
      });
    }

    const newReview = new ProductReview({
      productId,
      userId,
      userName,
      reviewMessage,
      reviewValue: rating,
    });

    await newReview.save();

    // ✅ More efficient + safe average calculation (no need to fetch all docs)
    const stats = await ProductReview.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$productId",
          avg: { $avg: "$reviewValue" },
        },
      },
    ]);

    const averageReview = stats?.[0]?.avg ?? rating;

    await Product.findByIdAndUpdate(productId, { averageReview });

    return res.status(201).json({
      success: true,
      data: newReview,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    // ✅ Prevent CastError noise for invalid ids (if stored as ObjectId)
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const reviews = await ProductReview.find({ productId }).lean();
    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { addProductReview, getProductReviews };
