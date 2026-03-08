import { z } from "zod";

const rawEnvSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_MAPBOX_TOKEN: z.string().optional(),
  MAPS_PROVIDER: z.enum(["google", "mapbox"]).default("google"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  MAPBOX_ACCESS_TOKEN: z.string().optional()
});

export const env = rawEnvSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
  MAPS_PROVIDER: process.env.MAPS_PROVIDER,
  GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN
});

export function requireEnv(key: keyof typeof env): string {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
