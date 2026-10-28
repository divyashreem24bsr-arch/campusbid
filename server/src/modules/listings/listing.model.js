import mongoose from "mongoose";
import {
  CATEGORIES,
  CONDITIONS,
  STATUSES,
} from "./listing.constants.js";

const listingSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    condition: {
      type: String,
      enum: CONDITIONS,
      required: true,
    },

    images: [
      {
        url: String,
        publicId: String,
        _id: false,
      },
    ],

    startingPrice: {
      type: Number,
      required: true,
      min: 1,
    },

    minIncrement: {
      type: Number,
      required: true,
      min: 1,
    },

    closesAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: STATUSES,
      default: "active",
    },

    // Used by the bidding feature in a later phase
    currentBid: {
      type: Number,
      default: 0,
    },

    leadingBidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    bidCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Help MongoDB find active listings efficiently
listingSchema.index({ status: 1, closesAt: 1 });

// Support searching by title or description
listingSchema.index({ title: "text", description: "text" });

export default mongoose.model("Listing", listingSchema);
