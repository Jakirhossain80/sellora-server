const mongoose = require("mongoose");
const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = "", brand = "", sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    // ✅ Handle query values safely whether they come as "" or comma-separated strings
    if (typeof category === "string" && category.length) {
      filters.category = { $in: category.split(",").filter(Boolean) };
    }

    if (typeof brand === "string" && brand.length) {
      filters.brand = { $in: brand.split(",").filter(Boolean) };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;

      case "price-hightolow":
        sort.price = -1;
        break;

      case "title-atoz":
        sort.title = 1;
        break;

      case "title-ztoa":
        sort.title = -1;
        break;

      default:
        sort.price = 1;
        break;
    }

    // ✅ lean() improves performance for read-only responses
    const products = await Product.find(filters).sort(sort).lean();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    // ✅ Fix: was logging an undefined variable "error"
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Prevent CastError noise for invalid ids
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // ✅ lean() for read-only response
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    // ✅ Fix: was logging an undefined variable "error"
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
