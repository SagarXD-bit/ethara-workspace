import { Router } from "express";
import { ZodError } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { login, signup } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/signup",
  asyncHandler(async (req, res, next) => {
    try {
      await signup(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid request." });
      }

      throw error;
    }
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res, next) => {
    try {
      await login(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid request." });
      }

      throw error;
    }
  })
);

export default router;
