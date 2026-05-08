"use server";

import { prisma } from "@/db/prisma";
import { getAuthSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createSessionAction(data: {
  topic: string;
  difficulty: string;
  duration: string;
}) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  const roomId = `room-${Math.random().toString(36).substring(2, 11)}`;

  const newSession = await prisma.session.create({
    data: {
      roomId,
      userId: session.userId,
      topic: data.topic,
      difficulty: data.difficulty,
      duration: data.duration,
    },
  });

  revalidatePath("/");
  return newSession;
}

export async function getSessionHistoryAction() {
  const session = await getAuthSession();
  if (!session) return [];

  return await prisma.session.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  });
}

export async function getSessionDetailsAction(roomId: string) {
  const session = await getAuthSession();
  if (!session) throw new Error("Unauthorized");

  return await prisma.session.findUnique({
    where: { roomId },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  });
}
