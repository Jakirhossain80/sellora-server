const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// ✅ Minimal safety: warn in production if any key is missing (no breaking changes)
const isProduction = process.env.NODE_ENV === "production";
if (
  isProduction &&
  (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET)
) {
  console.warn(
    "⚠️ WARNING: Missing Cloudinary env vars in production. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
  );
}

const storage = multer.memoryStorage();

//small guard + clearer error in case upload fails
async function imageUploadUtil(file) {
  if (!file) {
    throw new Error("No file provided for Cloudinary upload");
  }

  try {
    const result = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return result;
  } catch (err) {
    // keep stack/context for server logs
    console.error("Cloudinary upload failed:", err);
    throw err;
  }
}

// ✅ Minimal safety: basic file size limit (adjust if you already enforce elsewhere)
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

module.exports = { upload, imageUploadUtil };
