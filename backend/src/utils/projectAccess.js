import { prisma } from "../lib/prisma.js";

export async function getProjectForUser(projectId, user, include = {}) {
  const where =
    user.role === "ADMIN"
      ? {
          id: projectId,
          ownerId: user.id
        }
      : {
          id: projectId,
          members: {
            some: {
              userId: user.id
            }
          }
        };

  return prisma.project.findFirst({
    where,
    include
  });
}

export function buildParticipantList(project) {
  const owner = {
    id: project.owner.id,
    name: project.owner.name,
    email: project.owner.email,
    role: project.owner.role
  };

  const members = project.members.map((membership) => ({
    id: membership.user.id,
    name: membership.user.name,
    email: membership.user.email,
    role: membership.user.role
  }));

  const seen = new Set();

  return [owner, ...members].filter((participant) => {
    if (seen.has(participant.id)) {
      return false;
    }

    seen.add(participant.id);
    return true;
  });
}
