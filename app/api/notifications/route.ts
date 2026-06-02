import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// GET – fetch all notifications for the logged-in user (newest first)
export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    // Compute human-readable "time ago" for each notification
    const now = Date.now();
    const enriched = notifications.map((n) => {
      const diffMs = now - new Date(n.createdAt).getTime();
      const diffMin = Math.floor(diffMs / 60000);
      let time = "Just now";
      if (diffMin >= 1440) {
        const days = Math.floor(diffMin / 1440);
        time = `${days} day${days > 1 ? "s" : ""} ago`;
      } else if (diffMin >= 60) {
        const hrs = Math.floor(diffMin / 60);
        time = `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
      } else if (diffMin >= 1) {
        time = `${diffMin} min${diffMin > 1 ? "s" : ""} ago`;
      }
      return { ...n, time };
    });

    return NextResponse.json({ success: true, notifications: enriched });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST – create a new notification
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, icon, color } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const notification = await prisma.notification.create({
      data: {
        title,
        description,
        icon: icon || "notifications",
        color: color || "text-primary bg-primary/10 border-primary/20",
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, notification }, { status: 201 });
  } catch (error) {
    console.error("Notifications POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH – mark all notifications as read for the user
export async function PATCH() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { userId: session.userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE – remove a specific notification by id
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });
    }

    // Verify the notification belongs to this user
    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.userId) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await prisma.notification.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notifications DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
