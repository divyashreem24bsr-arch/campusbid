import jwt from "jsonwebtoken";
import User from "../modules/users/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      message: "Not authenticated",
    });
  }

  let payload;

  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  const user = await User.findById(payload.id);

  if (!user) {
    return res.status(401).json({
      message: "User no longer exists",
    });
  }

  req.user = user;
  next();
});
