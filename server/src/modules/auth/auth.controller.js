import bcrypt from "bcryptjs";
import User from "../users/user.model.js";
import { signToken } from "../../utils/token.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    department: user.department,
    year: user.year,
    contact: user.contact,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, department, year } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email and password are required",
    });
  }

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ message: "Enter a valid email" });
  }

  if (typeof password !== "string" || password.length < 8) {
    return res.status(400).json({
      message: "Password must be at least 8 characters",
    });
  }

  const exists = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (exists) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    passwordHash,
    department,
    year: year === "" || year == null ? undefined : Number(year),
  });

  res.status(201).json({
    token: signToken(user._id.toString()),
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+passwordHash");

  const isValid =
    user && (await bcrypt.compare(password, user.passwordHash));

  if (!isValid) {
    return res.status(401).json({
      message: "Invalid email or password",
    });
  }

  res.json({
    token: signToken(user._id.toString()),
    user: publicUser(user),
  });
});

export { publicUser };
