"use client";

import { useState } from "react";
import type { Coordinates, RankedPlace } from "@/lib/types";

type Props = {
  intent: string;
  userLocation?: Coordinates;
  rankedPlaces: RankedPlace[];
};

const quickQuestions = [
  "Which one should I choose right now?",
  "Who is open right now?",
  "What is the closest high-rated option?"
];

export function AskAgentPanel({ intent, userLocation, rankedPlaces }: Props) {
  const [question, setQuestion] = useState(quickQuestions[0]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");

  const ask = async () => {
    if (!question.trim() || !userLocation || !rankedPlaces.length) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          intent,
          userLocation,
          rankedPlaces
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to ask the agent");
      }
      setAnswer(data.answer);
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "Failed to ask agent");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border bg-card p-4">
      <h2 className="text-lg font-semibold">Ask the Agent</h2>
      <p className="mt-1 text-sm text-foreground/70">Get AI reasoning based on nearby results only.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => setQuestion(q)}
            className="rounded-full border px-3 py-1 text-xs transition hover:border-accent"
            type="button"
          >
            {q}
          </button>
        ))}
      </div>

      <textarea
        className="mt-3 w-full rounded-xl border bg-background p-3 text-sm"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        rows={3}
      />

      <button
        onClick={ask}
        disabled={loading || !rankedPlaces.length || !userLocation}
        className="mt-3 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
      >
        {loading ? "Thinking..." : "Ask Agent"}
      </button>

      {answer ? <p className="mt-3 rounded-xl bg-background p-3 text-sm">{answer}</p> : null}
    </section>
  );
}
