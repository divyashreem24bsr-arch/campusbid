import mongoose from "mongoose";
import Listing from "./listing.model.js";
import {
  CATEGORIES,
  CONDITIONS,
} from "./listing.constants.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const MIN_DURATION_MS = 5 * 60 * 1000;
const MAX_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

function parseListing(body, existingImages = []) {
  const {
    title,
    category,
    description = "",
    condition,
    startingPrice,
    minIncrement,
    closesAt,
    images = existingImages,
  } = body;

  if (
    typeof title !== "string" ||
    title.trim().length < 3 ||
    title.trim().length > 100
  ) {
    throw Object.assign(new Error("Title must be 3–100 characters."), {
      statusCode: 400,
    });
  }

  if (!CATEGORIES.includes(category)) {
    throw Object.assign(new Error("Invalid category."), {
      statusCode: 400,
    });
  }

  if (!CONDITIONS.includes(condition)) {
    throw Object.assign(new Error("Invalid item condition."), {
      statusCode: 400,
    });
  }

  if (typeof description !== "string" || description.length > 2000) {
    throw Object.assign(new Error("Description must be at most 2000 characters."), {
      statusCode: 400,
    });
  }

  const price = Number(startingPrice);
  const increment = Number(minIncrement);

  if (!Number.isInteger(price) || price < 1 || price > 10000000) {
    throw Object.assign(new Error("Starting price must be a whole number from ₹1 to ₹1 crore."), {
      statusCode: 400,
    });
  }

  if (!Number.isInteger(increment) || increment < 1 || increment > 10000000) {
    throw Object.assign(new Error("Minimum increment must be a whole number from ₹1 to ₹1 crore."), {
      statusCode: 400,
    });
  }

  const closingDate = new Date(closesAt);
  const duration = closingDate.getTime() - Date.now();

  if (
    !closesAt ||
    Number.isNaN(closingDate.getTime()) ||
    duration < MIN_DURATION_MS ||
    duration > MAX_DURATION_MS
  ) {
    throw Object.assign(
      new Error("Closing time must be between 5 minutes and 30 days from now."),
      { statusCode: 400 }
    );
  }

  if (!Array.isArray(images) || images.length < 1 || images.length > 5) {
    throw Object.assign(new Error("Please provide between 1 and 5 images."), {
      statusCode: 400,
    });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

  const validatedImages = images.map((image) => {
    if (
      !image ||
      typeof image.url !== "string" ||
      !image.url.startsWith(
        `https://res.cloudinary.com/${cloudName}/image/upload/`
      ) ||
      typeof image.publicId !== "string" ||
      !image.publicId.trim()
    ) {
      throw Object.assign(new Error("Each image must have a valid Cloudinary URL and public ID."), {
        statusCode: 400,
      });
    }

    return {
      url: image.url,
      publicId: image.publicId,
    };
  });

  return {
    title: title.trim(),
    category,
    description: description.trim(),
    condition,
    startingPrice: price,
    minIncrement: increment,
    closesAt: closingDate,
    images: validatedImages,
  };
}

export const createListing = asyncHandler(async (req, res) => {
  const listingData = parseListing(req.body);

  const listing = await Listing.create({
    ...listingData,
    sellerId: req.user._id,
    status: "active",
  });

  res.status(201).json({
    message: "Listing created successfully.",
    listing,
  });
});

export const listActive = asyncHandler(async (req, res) => {
  const listings = await Listing.find({
    status: "active",
    closesAt: { $gt: new Date() },
  })
    .populate("sellerId", "name department year")
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ listings });
});

export const myListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({
    sellerId: req.user._id,
  }).sort({ createdAt: -1 });

  res.json({ listings });
});

export const getListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid listing ID." });
  }

  const listing = await Listing.findById(id).populate(
    "sellerId",
    "name department year"
  );

  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  res.json({ listing });
});

export const updateListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid listing ID." });
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  if (listing.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only edit your own listings." });
  }

  if (listing.status !== "active" || listing.bidCount > 0) {
    return res.status(400).json({
      message: "Only active listings with no bids can be edited.",
    });
  }

  const listingData = parseListing(
    { ...listing.toObject(), ...req.body },
    listing.images
  );

  Object.assign(listing, listingData);
  await listing.save();

  res.json({
    message: "Listing updated successfully.",
    listing,
  });
});

export const cancelListing = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid listing ID." });
  }

  const listing = await Listing.findById(id);

  if (!listing) {
    return res.status(404).json({ message: "Listing not found." });
  }

  if (listing.sellerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only cancel your own listings." });
  }

  if (listing.status !== "active" || listing.bidCount > 0) {
    return res.status(400).json({
      message: "Only active listings with no bids can be cancelled.",
    });
  }

  listing.status = "cancelled";
  await listing.save();

  res.json({
    message: "Listing cancelled successfully.",
    listing,
  });
});
