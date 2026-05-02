import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient, Role, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD ?? "Admin@123", 10);
  const memberPassword = await bcrypt.hash(process.env.MEMBER_PASSWORD ?? "Member@123", 10);

  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL ?? "admin@example.com" },
    update: {
      name: "Demo Admin",
      passwordHash: adminPassword,
      role: Role.ADMIN
    },
    create: {
      name: "Demo Admin",
      email: process.env.ADMIN_EMAIL ?? "admin@example.com",
      passwordHash: adminPassword,
      role: Role.ADMIN
    }
  });

  const member = await prisma.user.upsert({
    where: { email: process.env.MEMBER_EMAIL ?? "member@example.com" },
    update: {
      name: "Demo Member",
      passwordHash: memberPassword,
      role: Role.MEMBER
    },
    create: {
      name: "Demo Member",
      email: process.env.MEMBER_EMAIL ?? "member@example.com",
      passwordHash: memberPassword,
      role: Role.MEMBER
    }
  });

  const project = await prisma.project.upsert({
    where: { id: "demo-project" },
    update: {
      name: "Product Launch",
      description: "Sample project for RBAC testing."
    },
    create: {
      id: "demo-project",
      name: "Product Launch",
      description: "Sample project for RBAC testing.",
      ownerId: admin.id
    }
  });

  await prisma.projectMember.upsert({
    where: {
      userId_projectId: {
        userId: member.id,
        projectId: project.id
      }
    },
    update: {},
    create: {
      userId: member.id,
      projectId: project.id
    }
  });

  await prisma.task.upsert({
    where: { id: "demo-task" },
    update: {
      title: "Prepare launch checklist",
      description: "Verify documentation and release notes.",
      status: TaskStatus.IN_PROGRESS,
      assignedToId: member.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
    },
    create: {
      id: "demo-task",
      title: "Prepare launch checklist",
      description: "Verify documentation and release notes.",
      status: TaskStatus.IN_PROGRESS,
      assignedToId: member.id,
      projectId: project.id,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
