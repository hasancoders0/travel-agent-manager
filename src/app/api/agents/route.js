
import { NextResponse } from "next/server";
import {
  getAgents,
  createAgent,
} from "@/lib/agents";

export const runtime = "nodejs";

const ALLOWED_ORIGINS = [
  "https://www.disneyfamilyshirts.shop",
  "https://disneyfamilyshirts.shop",
];

function corsHeaders(request) {
  const origin = request.headers.get("origin");
  const headers = new Headers();

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return headers;
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function GET(request) {
  const headers = corsHeaders(request);

  try {
    const agents = await getAgents();

    return NextResponse.json(agents, { headers });
  } catch (error) {
    console.error("GET agents error:", error);

    return NextResponse.json(
      { error: "Failed to load agents." },
      { status: 500, headers }
    );
  }
}

export async function POST(request) {
  const headers = corsHeaders(request);

  try {
    const body = await request.json();

    if (!body.agencyName?.trim()) {
      return NextResponse.json(
        { error: "Agency name is required." },
        { status: 400, headers }
      );
    }

    const agent = await createAgent(body);

    return NextResponse.json(agent, {
      status: 201,
      headers,
    });
  } catch (error) {
    console.error("POST agent error:", error);

    return NextResponse.json(
      { error: "Failed to create agent." },
      { status: 500, headers }
    );
  }
}
