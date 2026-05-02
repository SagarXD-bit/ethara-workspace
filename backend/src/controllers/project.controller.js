import { TaskStatus } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { buildParticipantList, getProjectForUser } from "../utils/projectAccess.js";

const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required."),
  description: z.string().trim().optional()
});

const addMemberSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional()
  })
  .refine((value) => value.userId || value.email, {
    message: "Provide a userId or email."
  });

const createTaskSchema = z.object({
  title: z.string().trim().min(2, "Task title is required."),
  description: z.string().trim().optional(),
  dueDate: z.string().datetime().optional().or(z.literal("")),
  assignedToId: z.string().trim().min(1, "assignedToId is required.")
});

function serializeProject(project) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    owner: {
      id: project.owner.id,
      name: project.owner.name,
      email: project.owner.email,
      role: project.owner.role
    },
    membersCount: project._count.members,
    tasksCount: project._count.tasks,
    createdAt: project.createdAt
  };
}

export async function getDashboard(req, res) {
  const projectWhere =
    req.user.role === "ADMIN"
      ? { ownerId: req.user.id }
      : {
          members: {
            some: {
              userId: req.user.id
            }
          }
        };

  const taskWhere =
    req.user.role === "ADMIN"
      ? {
          project: {
            ownerId: req.user.id
          }
        }
      : {
          project: {
            members: {
              some: {
                userId: req.user.id
              }
            }
          }
        };

  const [projectsCount, tasks] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.findMany({
      where: taskWhere,
      select: {
        id: true,
        status: true,
        dueDate: true
      }
    })
  ]);

  const now = new Date();
  const completed = tasks.filter((task) => task.status === TaskStatus.DONE).length;
  const inProgress = tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length;
  const overdue = tasks.filter(
    (task) => task.dueDate && task.status !== TaskStatus.DONE && new Date(task.dueDate) < now
  ).length;

  return res.json({
    stats: {
      projects: projectsCount,
      totalTasks: tasks.length,
      completed,
      inProgress,
      overdue
    }
  });
}

export async function listProjects(req, res) {
  const where =
    req.user.role === "ADMIN"
      ? {
          ownerId: req.user.id
        }
      : {
          members: {
            some: {
              userId: req.user.id
            }
          }
        };

  const projects = await prisma.project.findMany({
    where,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json({
    projects: projects.map(serializeProject)
  });
}

export async function getProjectDetails(req, res) {
  const project = await getProjectForUser(req.params.id, req.user, {
    owner: {
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    },
    members: {
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    },
    _count: {
      select: {
        tasks: true,
        members: true
      }
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found or unavailable." });
  }

  return res.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      owner: project.owner,
      members: buildParticipantList(project),
      membersCount: project._count.members,
      tasksCount: project._count.tasks,
      createdAt: project.createdAt
    }
  });
}

export async function createProject(req, res) {
  const payload = createProjectSchema.parse(req.body);

  const project = await prisma.project.create({
    data: {
      name: payload.name,
      description: payload.description,
      ownerId: req.user.id
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      },
      _count: {
        select: {
          members: true,
          tasks: true
        }
      }
    }
  });

  return res.status(201).json({
    project: serializeProject(project)
  });
}

export async function addProjectMember(req, res) {
  const payload = addMemberSchema.parse(req.body);
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: {
      owner: {
        select: {
          id: true
        }
      }
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const user = payload.userId
    ? await prisma.user.findUnique({ where: { id: payload.userId } })
    : await prisma.user.findUnique({ where: { email: payload.email } });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.id === project.owner.id) {
    return res.status(400).json({ message: "The project owner already has access." });
  }

  const membership = await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: user.id,
        projectId: project.id
      }
    },
    update: {},
    create: {
      userId: user.id,
      projectId: project.id
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      }
    }
  });

  return res.status(201).json({
    member: membership.user
  });
}

export async function getProjectTasks(req, res) {
  const project = await getProjectForUser(req.params.id, req.user);

  if (!project) {
    return res.status(404).json({ message: "Project not found or unavailable." });
  }

  const tasks = await prisma.task.findMany({
    where: {
      projectId: req.params.id
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
    },
    orderBy: [
      {
        dueDate: "asc"
      },
      {
        createdAt: "desc"
      }
    ]
  });

  return res.json({ tasks });
}

export async function createTask(req, res) {
  const payload = createTaskSchema.parse(req.body);
  const project = await prisma.project.findFirst({
    where: {
      id: req.params.id,
      ownerId: req.user.id
    },
    include: {
      owner: {
        select: {
          id: true
        }
      },
      members: {
        select: {
          userId: true
        }
      }
    }
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found." });
  }

  const canAssignToUser =
    payload.assignedToId === project.owner.id ||
    project.members.some((membership) => membership.userId === payload.assignedToId);

  if (!canAssignToUser) {
    return res.status(400).json({ message: "Assign tasks only to the project owner or members." });
  }

  const task = await prisma.task.create({
    data: {
      title: payload.title,
      description: payload.description,
      dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
      projectId: project.id,
      assignedToId: payload.assignedToId
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

  return res.status(201).json({ task });
}
