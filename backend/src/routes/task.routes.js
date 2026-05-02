import { Router } from "express";
import { ZodError } from "zod";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateTaskStatus } from "../controllers/task.controller.js";

const router = Router();

router.use(authMiddleware);

router.put(
  "/tasks/:id/status",
  asyncHandler(async (req, res, next) => {
    try {
      await updateTaskStatus(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid request." });
      }

      throw error;
    }
  })
);

export default router;
