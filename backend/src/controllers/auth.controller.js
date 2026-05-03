import bcrypt from "bcrypt";

import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { signToken, sanitizeUser } from "../utils/auth.js";
import { PrismaClient, Role } from "@prisma/client";
const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  email: z.string().trim().email("A valid email is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.nativeEnum(Role).optional()
});

const loginSchema = z.object({
  email: z.string().trim().email("A valid email is required."),
  password: z.string().min(1, "Password is required.")
});

export async function signup(req, res) {
  const payload = signupSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email }
  });

  if (existingUser) {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role ?? Role.MEMBER
    }
  });

  const safeUser = sanitizeUser(user);

  return res.status(201).json({
    token: signToken(safeUser),
    user: safeUser
  });
}

export async function login(req, res) {
  try {
    const payload = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: payload.email }
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const safeUser = sanitizeUser(user);

    return res.json({
      token: signToken(safeUser),
      user: safeUser
    });

  } catch (err) {
    console.error("LOGIN ERROR 👉", err); // 🔴 this is what we need
    return res.status(500).json({ message: "Something went wrong." });
  }
}