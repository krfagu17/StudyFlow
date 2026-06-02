import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Retrieve all tasks for the logged-in user
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tasks = await prisma.task.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("GET tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new task
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, subject, subjectColor, priority, estimatedTime, dueDate } = data;

    if (!title || !subject) {
      return NextResponse.json({ error: "Title and Subject are required" }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        subject,
        subjectColor: subjectColor || "bg-primary/20 text-primary border border-primary/30",
        priority: priority || "medium",
        status: "not-started",
        estimatedTime: estimatedTime || "",
        dueDate: dueDate || "",
        progress: 0,
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, task });
  } catch (error) {
    console.error("POST tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update an existing task (e.g. status transition or progress change)
export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, description, status, progress, priority, estimatedTime, dueDate, score, statusText } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingTask.title,
        description: description !== undefined ? description : existingTask.description,
        status: status !== undefined ? status : existingTask.status,
        progress: progress !== undefined ? progress : existingTask.progress,
        priority: priority !== undefined ? priority : existingTask.priority,
        estimatedTime: estimatedTime !== undefined ? estimatedTime : existingTask.estimatedTime,
        dueDate: dueDate !== undefined ? dueDate : existingTask.dueDate,
        score: score !== undefined ? score : existingTask.score,
        statusText: statusText !== undefined ? statusText : existingTask.statusText,
      },
    });

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error("PUT tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a task
export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingTask = await prisma.task.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE tasks error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
