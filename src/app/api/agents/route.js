
import { NextResponse } from "next/server";
import {
  getAgents,
  createAgent,
} from "@/lib/agents";

export const runtime = "nodejs";

export async function GET() {
  try {
    const agents = await getAgents();

    return NextResponse.json(agents);
  } catch (error) {
    console.error("GET agents error:", error);

    return NextResponse.json(
      { error: "Failed to load agents." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.agencyName?.trim()) {
      return NextResponse.json(
        { error: "Agency name is required." },
        { status: 400 }
      );
    }

    const agent = await createAgent(body);

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("POST agent error:", error);

    return NextResponse.json(
      { error: "Failed to create agent." },
      { status: 500 }
    );
  }
}
