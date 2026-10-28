import { asyncHandler } from "../../utils/asyncHandler.js";
import { publicUser } from "../auth/auth.controller.js";

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    user: publicUser(req.user),
  });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "year", "contact"];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      req.user[key] = req.body[key];
    }
  }

  await req.user.save();

  res.json({
    user: publicUser(req.user),
  });
});
