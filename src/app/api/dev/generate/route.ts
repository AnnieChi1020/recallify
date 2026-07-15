import { generateCardsFromText } from "@/lib/generate-cards";

const SAMPLE_TEXT = `The water cycle describes how water moves through Earth's systems. Water evaporates from oceans, condenses into clouds, falls as precipitation, and flows back to the sea through rivers.`;

export async function GET() {
  const cards = await generateCardsFromText(SAMPLE_TEXT);

  console.log(JSON.stringify(cards, null, 2));

  return Response.json(cards);
}
