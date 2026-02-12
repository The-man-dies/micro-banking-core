import { Router } from "express";
import { getAccountingStats } from "../controllers/accounting.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/accountings", protect, getAccountingStats);
export default router;
