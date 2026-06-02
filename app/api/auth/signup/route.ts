import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    // Create User along with initial default subjects and tasks for a complete bento experience
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        currentStreak: 12,
        xpProgress: 8450,
        flowLevel: 24,
        totalHours: 148.5,
        subjects: {
          createMany: {
            data: [
              {
                title: "Java Development",
                progress: 70,
                info: "8/12 Modules Completed",
                tags: ["Collections", "Multithreading"],
                icon: "code",
                colorClass: "text-orange-400 bg-orange-500/10",
                borderColorClass: "stroke-orange-400",
              },
              {
                title: "DSA Fundamentals",
                progress: 50,
                info: "15/30 Topics Remaining",
                tags: ["Graphs", "DP"],
                icon: "account_tree",
                colorClass: "text-primary bg-primary/10",
                borderColorClass: "stroke-primary",
              },
              {
                title: "Quantitative Aptitude",
                progress: 90,
                info: "2 Topics Remaining",
                tags: ["Time & Work", "Profit"],
                icon: "calculate",
                colorClass: "text-secondary bg-secondary/10",
                borderColorClass: "stroke-secondary",
              },
            ],
          },
        },
        tasks: {
          createMany: {
            data: [
              {
                title: "Quantum Mechanics Homework Set 4",
                description: "Complete the derivations for the Schrodinger equation in a 3D box model.",
                subject: "Physics II",
                subjectColor: "bg-primary/20 text-primary border border-primary/30",
                priority: "high",
                status: "not-started",
                estimatedTime: "2.5h est.",
                dueDate: "Oct 24",
                progress: 0,
              },
              {
                title: "Analyze 'The Waste Land' Part III",
                description: "Draft the initial notes for the Fire Sermon section focusing on modern alienation.",
                subject: "Literature",
                subjectColor: "bg-tertiary/20 text-tertiary border border-tertiary/30",
                priority: "low",
                status: "not-started",
                estimatedTime: "1.5h est.",
                dueDate: "Oct 28",
              },
              {
                title: "Implement B-Tree Algorithms",
                description: "Fixing the balancing logic for node deletions in the indexed database module.",
                subject: "Computer Science",
                subjectColor: "bg-secondary/20 text-secondary border border-secondary/30",
                priority: "medium",
                status: "in-progress",
                progress: 65,
              },
            ],
          },
        },
        notes: {
          create: {
            title: "Neural Pathway Connectivity",
            subject: "Neuroscience",
            subjectColor: "bg-primary/20 text-primary border border-primary/30",
            date: "Oct 24, 2023",
            readTime: "15 min read",
            imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBybBpUvxXjCqL0FDdI7tKvuJcqmypgMs8g3Snc2DMYlGsBfncFV_kiAJsqrKa0u-b2rxXtmNaZ1NkcEcrqU38MCv7ZwgElNnWvoaOygWLDzmfZkKzKOXi23vzLvVdsBZGepYJbd2-mAfAZ2toYEmg1BhLhNsVueU9cM23PADjDhi4f8q4KRj_x-j9Dxj_nzaz4CE7fU0TM6neZ1IBjnDAjHcC9aXY0qokooXMMhUc6FZii7k4tr6_Xc_9aEyBK3PB4pqWbf3o-PRBy",
            imageAlt: "Figure 1: Synaptic Density Mapping",
            content: "Neural pathways are essential for the transmission of signals throughout the central nervous system. These connections, formed by bundles of axons, facilitate communication between different regions of the brain and the spinal cord.\n\nThe capacity of the brain to change and adapt throughout life is known as neuroplasticity. This occurs through the strengthening or weakening of neural pathways in response to learning and experience.\n\n### Types of Neural Transmission\n*   **Electrical Synapses:** Direct physical connections between neurons allowing for rapid signal transfer.\n*   **Chemical Synapses:** Use neurotransmitters to relay signals across a synaptic cleft.\n\nWhen studying these pathways, it is crucial to consider the role of myelin—a fatty insulation layer that significantly increases the speed of electrical impulses along the axon. Degeneration of myelin is often linked to various neurological conditions.",
          },
        },
        notifications: {
          createMany: {
            data: [
              {
                title: "Welcome to StudyFlow!",
                description: "Your dynamic workspace and default subjects have been initialized. Start exploring!",
                icon: "auto_stories",
                color: "text-primary bg-primary/10 border-primary/20",
              },
              {
                title: "Streak Started 🔥",
                description: "Your 12-day study streak has begun. Keep logging study sessions to maintain it!",
                icon: "local_fire_department",
                color: "text-secondary bg-secondary/10 border-secondary/20",
              },
              {
                title: "Level Up!",
                description: "Congratulations! You've reached Flow Level 24. Keep pushing your limits.",
                icon: "military_tech",
                color: "text-tertiary bg-tertiary/10 border-tertiary/20",
              },
            ],
          },
        },
      },
    });

    const token = signToken({ userId: user.id });

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });

    // Set secure cookie
    response.cookies.set("studyflow_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
