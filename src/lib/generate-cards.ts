import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";

import { generatedCardsSchema } from "./validations";

export async function generateCardsFromText(text: string) {
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

  return output.cards;
}
