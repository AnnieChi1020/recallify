import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";

import { generatedCardsSchema } from "@/lib/validations";

const SAMPLE_TEXT = `The water cycle describes how water moves through Earth's systems. Water evaporates from oceans, condenses into clouds, falls as precipitation, and flows back to the sea through rivers.`;

export async function GET() {
  const { output } = await generateText({
    model: openai("gpt-4o-mini"),
    output: Output.object({ schema: generatedCardsSchema }),
    system:
      "You are a flashcard generator. Create clear, atomic flashcards " +
      "from the provided text. Each card tests exactly one fact or concept.",
    prompt:
      "Generate 5 flashcards from this text:" +
      `\n\n${SAMPLE_TEXT}` +
      "\n\nFor qa cards, set options to null.",
  });

  console.log(JSON.stringify(output, null, 2));
  return Response.json(output);
}
