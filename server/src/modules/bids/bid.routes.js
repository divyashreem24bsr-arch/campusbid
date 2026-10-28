import express from "express";
import {
  placeBid,
  getBidHistory,
} from "./bid.controller.js";
import { protect } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/:listingId", protect, placeBid);
router.get("/:listingId", protect, getBidHistory);

export default router;
