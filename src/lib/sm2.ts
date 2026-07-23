export type CardState = {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
};

export function calculateNextReview(
  state: CardState,
  rating: number,
): CardState & { dueAt: Date } {
  let { easeFactor, intervalDays, repetitions } = state;

  if (rating < 3) {
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + intervalDays);

  return { easeFactor, intervalDays, repetitions, dueAt };
}
