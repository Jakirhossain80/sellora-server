const mongoose = require("mongoose");
const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");

const handleImageUpload = async (req, res) => {
  try {
    // ✅ Minimal guard to avoid crashing when no file is sent
    if (!req.file?.buffer) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    return res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // ⚠️ Keeping your existing behavior; just removing noisy console log
    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    });

    await newlyCreatedProduct.save();
    return res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//fetch all products (paginated)
const fetchAllProducts = async (req, res) => {
  try {
    // ✅ Pagination via query params (defaults: page=1, limit=8)
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "8", 10), 1);

    // ✅ optional safety cap to prevent huge payloads
    const safeLimit = Math.min(limit, 50);

    const skip = (page - 1) * safeLimit;

    // ✅ Fetch paginated data + total count (no business logic changed)
    const [listOfProducts, totalItems] = await Promise.all([
      Product.find({}).skip(skip).limit(safeLimit).lean(),
      Product.countDocuments({}),
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit);

    return res.status(200).json({
      success: true,
      data: listOfProducts,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit: safeLimit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//edit a product
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    // ✅ Prevent CastError for invalid ObjectId (minimal + safe)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.brand = brand || findProduct.brand;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.image = image || findProduct.image;
    findProduct.averageReview = averageReview || findProduct.averageReview;

    await findProduct.save();
    return res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Prevent CastError for invalid ObjectId (minimal + safe)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
