import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subjects = await prisma.subject.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, subjects });
  } catch (error) {
    console.error("GET subjects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, progress, info, tags, icon, colorClass, borderColorClass } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        title,
        progress: progress !== undefined ? progress : 0,
        info: info || "0 Topics Remaining",
        tags: tags || [],
        icon: icon || "menu_book",
        colorClass: colorClass || "text-primary bg-primary/10",
        borderColorClass: borderColorClass || "stroke-primary",
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, subject });
  } catch (error) {
    console.error("POST subjects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
