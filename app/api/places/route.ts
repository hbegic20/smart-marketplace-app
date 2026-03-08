import { NextResponse } from "next/server";
import { z } from "zod";
import { env, requireEnv } from "@/lib/env";
import { runDeterministicRanking } from "@/lib/ai-agent";
import { searchNearbyPlaces } from "@/lib/places";

const requestSchema = z.object({
  intent: z.string().min(2),
  userLocation: z
    .object({
      lat: z.number(),
      lng: z.number()
    })
    .optional(),
  locationQuery: z.string().min(2).optional(),
  radiusMeters: z.number().int().positive().max(50000).optional()
});

export async function POST(req: Request) {
  try {
    const body = requestSchema.parse(await req.json());

    const { center, places } = await searchNearbyPlaces(body, {
      provider: env.MAPS_PROVIDER,
      googleApiKey: env.MAPS_PROVIDER === "google" ? requireEnv("GOOGLE_MAPS_API_KEY") : undefined,
      mapboxToken: env.MAPS_PROVIDER === "mapbox" ? requireEnv("MAPBOX_ACCESS_TOKEN") : undefined
    });

    const { rankedPlaces, summary } = runDeterministicRanking({
      intent: body.intent,
      userLocation: center,
      places
    });

    return NextResponse.json({
      center,
      rawCount: places.length,
      rankedPlaces,
      summary
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
