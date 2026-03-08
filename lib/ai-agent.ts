import OpenAI from "openai";
import { rankPlaces, summaryFromRanking } from "@/lib/ranking";
import type { AskAgentRequest, RankedPlace, RankingInput } from "@/lib/types";

const MODEL = "gpt-4o-mini";

export function runDeterministicRanking(input: RankingInput) {
  const rankedPlaces = rankPlaces(input);
  const summary = summaryFromRanking(rankedPlaces);

  return {
    rankedPlaces,
    summary
  };
}

export async function askAgent(
  req: AskAgentRequest,
  apiKey: string
): Promise<{ answer: string; highlights: RankedPlace[] }> {
  const client = new OpenAI({ apiKey });

  const compact = req.rankedPlaces.slice(0, 8).map((p) => ({
    name: p.name,
    distanceKm: p.distanceKm,
    openNow: p.openNow,
    rating: p.rating,
    why: p.why,
    score: p.score
  }));

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are a local-services recommender. Use only the provided place data. Do not claim web browsing or extra facts. Give practical concise advice."
      },
      {
        role: "user",
        content: JSON.stringify({
          intent: req.intent,
          userLocation: req.userLocation,
          question: req.question,
          candidates: compact
        })
      }
    ]
  });

  return {
    answer:
      completion.choices[0]?.message?.content?.trim() ??
      "Based on available data, choose the highest-ranked open option with the shortest distance.",
    highlights: req.rankedPlaces.slice(0, 3)
  };
}
