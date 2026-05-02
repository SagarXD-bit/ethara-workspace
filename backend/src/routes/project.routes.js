import { Router } from "express";
import { ZodError } from "zod";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  addProjectMember,
  createProject,
  createTask,
  getDashboard,
  getProjectDetails,
  getProjectTasks,
  listProjects
} from "../controllers/project.controller.js";

const router = Router();

function withValidation(handler) {
  return asyncHandler(async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: error.issues[0]?.message ?? "Invalid request." });
      }

      throw error;
    }
  });
}

router.use(authMiddleware);
router.get("/dashboard", withValidation(getDashboard));
router.get("/projects", withValidation(listProjects));
router.get("/projects/:id", withValidation(getProjectDetails));
router.post("/projects", requireAdmin, withValidation(createProject));
router.post("/projects/:id/members", requireAdmin, withValidation(addProjectMember));
router.get("/projects/:id/tasks", withValidation(getProjectTasks));
router.post("/projects/:id/tasks", requireAdmin, withValidation(createTask));

export default router;
