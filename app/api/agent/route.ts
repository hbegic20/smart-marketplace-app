import { NextResponse } from "next/server";
import { z } from "zod";
import { askAgent } from "@/lib/ai-agent";
import { requireEnv } from "@/lib/env";

const requestSchema = z.object({
  question: z.string().min(2),
  intent: z.string().min(2),
  userLocation: z.object({
    lat: z.number(),
    lng: z.number()
  }),
  rankedPlaces: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      address: z.string(),
      coordinates: z.object({ lat: z.number(), lng: z.number() }),
      rating: z.number().optional(),
      openNow: z.boolean().optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
      mapsUrl: z.string().optional(),
      businessStatus: z.string().optional(),
      types: z.array(z.string()).optional(),
      distanceKm: z.number().optional(),
      score: z.number(),
      badges: z.array(z.string()),
      why: z.string()
    })
  )
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());
    const result = await askAgent(body, requireEnv("OPENAI_API_KEY"));
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
