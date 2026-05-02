import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";

const updateTaskSchema = z.object({
  status: z.nativeEnum(TaskStatus)
});

export async function updateTaskStatus(req, res) {
  const payload = updateTaskSchema.parse(req.body);
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      project: {
        select: {
          ownerId: true
        }
      }
    }
  });

  if (!task) {
    return res.status(404).json({ message: "Task not found." });
  }

  const isAdminOwner = req.user.role === "ADMIN" && task.project.ownerId === req.user.id;
  const isAssignedMember = req.user.role === "MEMBER" && task.assignedToId === req.user.id;

  if (!isAdminOwner && !isAssignedMember) {
    return res.status(403).json({ message: "You do not have permission to update this task." });
  }

  const updatedTask = await prisma.task.update({
    where: { id: req.params.id },
    data: {
      status: payload.status
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return res.json({ task: updatedTask });
}
