import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";

import { generatedCardsSchema } from "./validations";

type GeneratedCard = z.infer<typeof generatedCardsSchema>["cards"][number];

function postProcessCards(cards: GeneratedCard[]) {
  const seen = new Set<string>();
  return cards
    .filter((c) => {
      if (c.question.length < 5 || c.answer.length < 1) return false;
      const key = c.question.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 50);
}

export async function generateCardsFromText(text: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { output } = await generateText({
        model: openai("gpt-4o-mini"),
        output: Output.object({ schema: generatedCardsSchema }),
        system:
          "You are a flashcard generator. Create clear, atomic flashcards " +
          "from the provided text. Each card tests exactly one fact or concept.",
        prompt:
          "Generate 5 flashcards from this text:" +
          `\n\n${text}` +
          "\n\nFor qa cards, set options to null.",
      });

      return postProcessCards(output.cards);
    } catch (err) {
      if (attempt === 1) throw err;
    }
  }

  throw new Error("unreachable");
}
