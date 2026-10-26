
import { NextResponse } from "next/server";
import {
  getAgentById,
  updateAgent,
  deleteAgent,
} from "@/lib/agents";

export const runtime = "nodejs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const agent = await getAgentById(id);

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(agent);
  } catch (error) {
    console.error("GET agent error:", error);

    return NextResponse.json(
      { error: "Failed to load agent." },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.agencyName?.trim()) {
      return NextResponse.json(
        { error: "Agency name is required." },
        { status: 400 }
      );
    }

    const agent = await updateAgent(id, body);

    return NextResponse.json(agent);
  } catch (error) {
    console.error("PATCH agent error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update agent." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await deleteAgent(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE agent error:", error);

    if (error?.code === "P2025") {
      return NextResponse.json(
        { error: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete agent." },
      { status: 500 }
    );
  }
}
