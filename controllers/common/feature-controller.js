const Feature = require("../../models/Feature");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    // ✅ Minimal validation to avoid saving empty/undefined image
    if (!image || typeof image !== "string" || !image.trim()) {
      return res.status(400).json({
        success: false,
        message: "Image is required!",
      });
    }

    const featureImages = new Feature({
      image: image.trim(),
    });

    await featureImages.save();

    return res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    // ✅ lean() for faster read + less memory (safe for read-only)
    const images = await Feature.find({}).lean();

    return res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages };
