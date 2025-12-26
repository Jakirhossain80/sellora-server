const mongoose = require("mongoose");
const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohigh",
      page = "1",
      limit = "8",
    } = req.query;

    // ✅ Pagination
    const currentPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 8, 1);
    const safeLimit = Math.min(parsedLimit, 50);
    const skip = (currentPage - 1) * safeLimit;

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

    // ✅ Apply pagination + total count (same business logic)
    const [products, totalItems] = await Promise.all([
      Product.find(filters).sort(sort).skip(skip).limit(safeLimit).lean(),
      Product.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit);

    return res.status(200).json({
      success: true,
      data: products,
      pagination: {
        totalItems,
        totalPages,
        currentPage,
        limit: safeLimit,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (e) {
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
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails };
