const mongoose = require("mongoose");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

/**
 * ✅ Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const qty = Number(quantity);
    if (!userId || !productId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    // Prevent CastError
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      cart.items.push({ productId, quantity: qty });
    } else {
      cart.items[index].quantity += qty;
    }

    await cart.save();

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

/**
 * ✅ Fetch cart items
 */
const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is mandatory!",
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    // Remove invalid products
    const validItems = cart.items.filter(
      (item) => item.productId !== null
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const populatedItems = validItems.map((item) => ({
      productId: item.productId._id,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

/**
 * ✅ Update cart item quantity
 */
const updateCartItemQty = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    const qty = Number(quantity);
    if (!userId || !productId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    const index = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Cart item not present!",
      });
    }

    cart.items[index].quantity = qty;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populatedItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

/**
 * ✅ Delete single cart item
 */
const deleteCartItem = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!userId || !productId) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json({
        success: true,
        data: { items: [] },
      });
    }

    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found!",
      });
    }

    cart.items = cart.items.filter(
      (item) =>
        item.productId &&
        item.productId._id.toString() !== productId
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "image title price salePrice",
    });

    const populatedItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
    }));

    return res.status(200).json({
      success: true,
      data: {
        ...cart._doc,
        items: populatedItems,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

/**
 * ✅ NEW: Clear entire cart (used after successful payment)
 */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({
        success: true,
        message: "Cart already empty",
      });
    }

    cart.items = [];
    await cart.save();

    return res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

module.exports = {
  addToCart,
  fetchCartItems,
  updateCartItemQty,
  deleteCartItem,
  clearCart,
};
