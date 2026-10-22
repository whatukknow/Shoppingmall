import type { TasteAnswers } from './answers';

export type CreditQuote = { n: number; why: string };

export class CreditLedger {
  private day = '';
  private week = '';
  private dailyCredits = 0;
  private weeklyCredits = 0;
  private results = new Set<string>();

  constructor(private now: () => Date = () => new Date()) {}

  private refresh() {
    const date = this.now();
    const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const week = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (this.day !== day) {
      this.day = day;
      this.dailyCredits = 0;
    }
    if (this.week !== week) {
      this.week = week;
      this.weeklyCredits = 0;
    }
  }

  quote(answers: TasteAnswers, count: number): CreditQuote {
    this.refresh();
    const key = [
      answers.y,
      answers.m,
      answers.d,
      answers.g,
      answers.sun ?? 'b',
      answers.fridge ?? 'empty',
    ].join('|');
    if (this.results.has(key)) return { n: 0, why: 'same' };
    this.results.add(key);
    const n = Math.max(
      0,
      Math.min(count, 8 - this.dailyCredits, 20 - this.weeklyCredits),
    );
    return {
      n,
      why: n
        ? n < count
          ? 'cap'
          : ''
        : this.dailyCredits >= 8
          ? 'day'
          : 'week',
    };
  }

  spend() {
    this.refresh();
    this.dailyCredits++;
    this.weeklyCredits++;
  }

  remaining() {
    this.refresh();
    return { day: 8 - this.dailyCredits, week: 20 - this.weeklyCredits };
  }
}
