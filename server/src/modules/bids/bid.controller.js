import mongoose from "mongoose";
import Bid from "./bid.model.js";
import Listing from "../listings/listing.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const placeBid = asyncHandler(async (req, res) => {
  const { amount } = req.body ?? {};
  const { listingId } = req.params;

  if (!mongoose.isValidObjectId(listingId)) {
    return res.status(400).json({
      message: "Invalid listing ID.",
    });
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({
      message: "Enter a valid bid amount.",
    });
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({
      message: "Listing not found.",
    });
  }

  if (listing.status !== "active") {
    return res.status(400).json({
      message: "This listing is not active.",
    });
  }

  if (new Date(listing.closesAt) <= new Date()) {
    return res.status(400).json({
      message: "The bidding period has ended.",
    });
  }

  if (listing.sellerId.equals(req.user._id)) {
    return res.status(403).json({
      message: "You cannot bid on your own listing.",
    });
  }

  const highestBid = await Bid.findOne({ listing: listingId }).sort({
    amount: -1,
  });

  const minimumBid = highestBid
    ? highestBid.amount + listing.minIncrement
    : listing.startingPrice;

  if (amount < minimumBid) {
    return res.status(400).json({
      message: `Your bid must be at least ₹${minimumBid}.`,
      minimumBid,
    });
  }

  const bid = await Bid.create({
    listing: listingId,
    bidder: req.user._id,
    amount,
  });

  listing.currentBid = amount;
  listing.leadingBidderId = req.user._id;
  listing.bidCount += 1;
  await listing.save();

  return res.status(201).json({
    message: "Bid placed successfully.",
    bid,
    currentBid: listing.currentBid,
    bidCount: listing.bidCount,
  });
});

export const getBidHistory = asyncHandler(async (req, res) => {
  const { listingId } = req.params;

  if (!mongoose.isValidObjectId(listingId)) {
    return res.status(400).json({
      message: "Invalid listing ID.",
    });
  }

  const listing = await Listing.findById(listingId);

  if (!listing) {
    return res.status(404).json({
      message: "Listing not found.",
    });
  }

  const bids = await Bid.find({ listing: listingId })
    .populate("bidder", "name department year")
    .sort({ amount: -1, createdAt: -1 })
    .limit(50);

  res.json({
    bids,
    count: bids.length,
  });
});
