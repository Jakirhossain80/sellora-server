const mongoose = require("mongoose");
const Address = require("../../models/Address");

const addAddress = async (req, res) => {
  try {
    const { userId, address, city, pincode, phone, notes } = req.body;

    // ✅ Minimal validation (keeps same requirement: all fields must exist)
    if (!userId || !address || !city || !pincode || !phone || !notes) {
      return res.status(400).json({
        success: false,
        message: "Invalid data provided!",
      });
    }

    // ✅ Prevent CastError noise if userId is expected to be an ObjectId
    // (If your Address.userId is a String, this won't hurt; it just won't block.)
    if (mongoose.isValidObjectId && mongoose.Schema?.Types?.ObjectId) {
      // Only validate if it's plausibly an ObjectId-shaped value
      // (Avoid breaking if you store userId as a plain string like Firebase UID.)
      const looksLikeObjectId = typeof userId === "string" && userId.length === 24;
      if (looksLikeObjectId && !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid data provided!",
        });
      }
    }

    const newlyCreatedAddress = new Address({
      userId,
      address: typeof address === "string" ? address.trim() : address,
      city: typeof city === "string" ? city.trim() : city,
      pincode,
      notes: typeof notes === "string" ? notes.trim() : notes,
      phone,
    });

    await newlyCreatedAddress.save();

    return res.status(201).json({
      success: true,
      data: newlyCreatedAddress,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const fetchAllAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User id is required!",
      });
    }

    // ✅ lean() for faster reads (safe for read-only list)
    const addressList = await Address.find({ userId }).lean();

    return res.status(200).json({
      success: true,
      data: addressList,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const editAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    // ✅ Prevent CastError for invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // ✅ Minimal safety: avoid updating identifiers accidentally
    if (formData?._id) delete formData._id;
    if (formData?.userId) delete formData.userId;

    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      formData,
      { new: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return res.status(400).json({
        success: false,
        message: "User and address id is required!",
      });
    }

    // ✅ Prevent CastError for invalid ObjectId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const address = await Address.findOneAndDelete({ _id: addressId, userId });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error",
    });
  }
};

module.exports = { addAddress, editAddress, fetchAllAddress, deleteAddress };
