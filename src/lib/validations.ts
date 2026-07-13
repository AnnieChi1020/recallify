import { z } from "zod";

export const createDeckSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  sourceText: z
    .string()
    .trim()
    .min(1, "Source text is required")
    .max(8000, "Source text must be less than 8000 characters"),
});

export const generatedCardsSchema = z.object({
  cards: z
    .array(
      z.object({
        type: z.enum(["qa", "mcq"]),
        question: z.string().min(1),
        answer: z.string().min(1),
        options: z.array(z.string()).length(4).nullable(),
      }),
    )
    .min(1)
    .max(20),
});
