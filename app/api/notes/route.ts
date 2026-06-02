import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET: Retrieve all notes for the logged-in user
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notes = await prisma.note.findMany({
      where: { userId: session.userId },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ success: true, notes });
  } catch (error) {
    console.error("GET notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: Create a new note
export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, subject, subjectColor, content, imageUrl, imageAlt } = await request.json();

    if (!title || !subject) {
      return NextResponse.json({ error: "Title and Subject are required" }, { status: 400 });
    }

    const note = await prisma.note.create({
      data: {
        title,
        subject,
        subjectColor: subjectColor || "bg-primary/20 text-primary border border-primary/30",
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        readTime: "5 min read",
        content: content || "",
        imageUrl: imageUrl || "",
        imageAlt: imageAlt || "",
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error("POST notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update an existing note
export async function PUT(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, title, content, subject, subjectColor, readTime, imageUrl, imageAlt } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingNote.title,
        content: content !== undefined ? content : existingNote.content,
        subject: subject !== undefined ? subject : existingNote.subject,
        subjectColor: subjectColor !== undefined ? subjectColor : existingNote.subjectColor,
        readTime: readTime !== undefined ? readTime : existingNote.readTime,
        imageUrl: imageUrl !== undefined ? imageUrl : existingNote.imageUrl,
        imageAlt: imageAlt !== undefined ? imageAlt : existingNote.imageAlt,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    });

    return NextResponse.json({ success: true, note: updatedNote });
  } catch (error) {
    console.error("PUT notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Delete a note
export async function DELETE(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingNote = await prisma.note.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
