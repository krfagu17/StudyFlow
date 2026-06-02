import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        currentStreak: true,
        xpProgress: true,
        flowLevel: true,
        totalHours: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, stats: user });
  } catch (error) {
    console.error("GET user stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { xpProgress, totalHours, currentStreak, flowLevel } = data;

    // Get current user to verify existence
    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (xpProgress !== undefined) updateData.xpProgress = xpProgress;
    if (totalHours !== undefined) updateData.totalHours = totalHours;
    if (currentStreak !== undefined) updateData.currentStreak = currentStreak;
    if (flowLevel !== undefined) updateData.flowLevel = flowLevel;

    // Automatically level up if XP exceeds level threshold (e.g. 1000 XP per level)
    if (xpProgress !== undefined) {
      const calculatedLevel = Math.max(1, Math.floor(xpProgress / 1000) + 1);
      if (calculatedLevel > (flowLevel !== undefined ? flowLevel : existingUser.flowLevel)) {
        updateData.flowLevel = calculatedLevel;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        currentStreak: true,
        xpProgress: true,
        flowLevel: true,
        totalHours: true,
      },
    });

    return NextResponse.json({ success: true, stats: updatedUser });
  } catch (error) {
    console.error("PUT user stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
