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
