import { describe, it, expect } from "vitest";

import { calculateNextReview } from "./sm2";

const initial = { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };

describe("calculateNextReview", () => {
  it("resets on a wrong answer", () => {
    const result = calculateNextReview(initial, 1);

    expect(result.repetitions).toBe(0);
    expect(result.intervalDays).toBe(1);
  });

  it("schedules interval=1 after first correct answer", () => {
    const result = calculateNextReview(initial, 4);

    expect(result.repetitions).toBe(1);
    expect(result.intervalDays).toBe(1);
  });

  it("schedules interval=6 after second correct answer", () => {
    const afterFirst = calculateNextReview(initial, 4);
    const afterSecond = calculateNextReview(afterFirst, 4);

    expect(afterSecond.repetitions).toBe(2);
    expect(afterSecond.intervalDays).toBe(6);
  });

  it("never drops easeFactor below 1.3", () => {
    let state = initial;

    for (let i = 0; i < 20; i++) {
      state = calculateNextReview(state, 0);
    }

    expect(state.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("sets dueAt in the future", () => {
    const result = calculateNextReview(initial, 5);
    expect(result.dueAt.getTime()).toBeGreaterThan(Date.now());
  });
});
