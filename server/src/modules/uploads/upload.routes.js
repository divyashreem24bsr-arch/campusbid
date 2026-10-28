import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { signUpload } from "./upload.controller.js";

const router = Router();

// Only logged-in users can request an upload signature
router.post("/sign", requireAuth, signUpload);

export default router;
