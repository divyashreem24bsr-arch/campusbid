import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  createListing,
  listActive,
  myListings,
  getListing,
  updateListing,
  cancelListing,
} from "./listing.controller.js";

const router = Router();

// All listing routes require login
router.use(requireAuth);

// Browse active listings
router.get("/", listActive);

// Create a new listing
router.post("/", createListing);

// View your own listings
// Keep this route before /:id
router.get("/mine", myListings);

// View one listing
router.get("/:id", getListing);

// Edit a listing
router.patch("/:id", updateListing);

// Cancel a listing
router.post("/:id/cancel", cancelListing);

export default router;
