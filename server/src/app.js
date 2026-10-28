
import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import listingRoutes from "./modules/listings/listing.routes.js";
import uploadRoutes from "./modules/uploads/upload.routes.js";
import bidRoutes from "./modules/bids/bid.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "CampusBid" });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// User profile routes
app.use("/api/users", userRoutes);

// Listing routes
app.use("/api/listings", listingRoutes);
app.use("/api/uploads", uploadRoutes);

// Bidding routes
app.use("/api/bids", bidRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
