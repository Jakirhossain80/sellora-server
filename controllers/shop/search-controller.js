const Product = require("../../models/Product");

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.params;

    // ✅ Fix typo: "succes" -> "success" (safe + no behavior change intended)
    if (!keyword || typeof keyword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    // ✅ Minimal safety: trim + avoid regex injection / invalid patterns
    const safeKeyword = keyword.trim();
    if (!safeKeyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required and must be in string format",
      });
    }

    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regEx = new RegExp(escapeRegex(safeKeyword), "i");

    const createSearchQuery = {
      $or: [
        { title: regEx },
        { description: regEx },
        { category: regEx },
        { brand: regEx },
      ],
    };

    // ✅ lean() for faster reads (safe for read-only)
    const searchResults = await Product.find(createSearchQuery).lean();

    return res.status(200).json({
      success: true,
      data: searchResults,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { searchProducts };
