import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    department: {
      type: String,
      trim: true,
      maxlength: 60,
      default: "",
    },
    year: {
      type: Number,
      min: 1,
      max: 6,
    },
    contact: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
