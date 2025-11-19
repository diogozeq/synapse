/**
 * Spaced Repetition System using SuperMemo SM-2 Algorithm
 *
 * This implementation optimizes long-term retention by scheduling reviews
 * at increasing intervals based on recall performance.
 *
 * Reference: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method
 */

import { SpacedRepetitionMetadata, Flashcard, CourseModule } from '../types';

/**
 * Quality of recall (0-5):
 * 5: Perfect recall
 * 4: Correct after hesitation
 * 3: Correct with serious difficulty
 * 2: Incorrect, but familiar
 * 1: Incorrect, very vague
 * 0: Complete blackout
 */
export type RecallQuality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Initialize spaced repetition metadata with default values
 */
export function initializeSRMetadata(): SpacedRepetitionMetadata {
  return {
    easinessFactor: 2.5, // Default difficulty
    interval: 1, // First review in 1 day
    repetitions: 0,
    lastReviewDate: new Date().toISOString(),
  };
}

/**
 * Calculate next review date and updated metadata based on SM-2 algorithm
 *
 * @param quality - Recall quality (0-5)
 * @param metadata - Current spaced repetition metadata
 * @returns Updated metadata and next review date
 */
export function calculateNextReview(
  quality: RecallQuality,
  metadata: SpacedRepetitionMetadata = initializeSRMetadata()
): { nextDate: string; newMetadata: SpacedRepetitionMetadata } {
  let { easinessFactor, interval, repetitions } = metadata;

  // Calculate new easiness factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easinessFactor = Math.max(
    1.3,
    easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  // If quality < 3, reset repetitions (failed recall)
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // Start over with 1 day
  } else {
    // Successful recall
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1; // First successful recall: 1 day
    } else if (repetitions === 2) {
      interval = 6; // Second successful recall: 6 days
    } else {
      interval = Math.round(interval * easinessFactor); // Subsequent: multiply by EF
    }
  }

  // Calculate next review date
  const now = new Date();
  const nextReviewDate = new Date(now);
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  const newMetadata: SpacedRepetitionMetadata = {
    easinessFactor,
    interval,
    repetitions,
    lastReviewDate: now.toISOString(),
  };

  return {
    nextDate: nextReviewDate.toISOString(),
    newMetadata,
  };
}

/**
 * Convert score (0-100) to recall quality (0-5)
 * This maps performance on activities to SM-2 quality scale
 */
export function scoreToQuality(score: number): RecallQuality {
  if (score >= 95) return 5; // Perfect
  if (score >= 85) return 4; // Good
  if (score >= 70) return 3; // Pass
  if (score >= 50) return 2; // Weak
  if (score >= 30) return 1; // Poor
  return 0; // Fail
}

/**
 * Get all flashcards that are due for review
 */
export function getReviewableFlashcards(
  flashcards: Flashcard[],
  currentDate: Date = new Date()
): Flashcard[] {
  return flashcards.filter(card => {
    if (!card.nextReviewDate) return true; // Never reviewed = due now
    const reviewDate = new Date(card.nextReviewDate);
    return reviewDate <= currentDate;
  });
}

/**
 * Get all modules that are due for review
 */
export function getReviewableModules(
  modules: CourseModule[],
  currentDate: Date = new Date()
): CourseModule[] {
  return modules.filter(module => {
    // Only completed modules can be reviewed
    if (!module.isCompleted) return false;
    if (!module.nextReviewDate) return false; // Not set up for review

    const reviewDate = new Date(module.nextReviewDate);
    return reviewDate <= currentDate;
  });
}

/**
 * Check if an item is due for review today
 */
export function isDueToday(nextReviewDate: string | undefined): boolean {
  if (!nextReviewDate) return true; // Never reviewed = due

  const reviewDate = new Date(nextReviewDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  reviewDate.setHours(0, 0, 0, 0);

  return reviewDate <= today;
}

/**
 * Get statistics about review items
 */
export interface ReviewStats {
  totalItems: number;
  dueToday: number;
  dueThisWeek: number;
  averageInterval: number;
}

export function getReviewStats(
  items: (Flashcard | CourseModule)[],
  currentDate: Date = new Date()
): ReviewStats {
  const today = new Date(currentDate);
  today.setHours(0, 0, 0, 0);

  const weekFromNow = new Date(today);
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  let dueToday = 0;
  let dueThisWeek = 0;
  let totalInterval = 0;
  let itemsWithInterval = 0;

  items.forEach(item => {
    if (item.nextReviewDate) {
      const reviewDate = new Date(item.nextReviewDate);
      reviewDate.setHours(0, 0, 0, 0);

      if (reviewDate <= today) dueToday++;
      if (reviewDate <= weekFromNow) dueThisWeek++;

      if (item.srMetadata) {
        totalInterval += item.srMetadata.interval;
        itemsWithInterval++;
      }
    } else {
      // Items without review date are due immediately
      dueToday++;
      dueThisWeek++;
    }
  });

  return {
    totalItems: items.length,
    dueToday,
    dueThisWeek,
    averageInterval: itemsWithInterval > 0 ? Math.round(totalInterval / itemsWithInterval) : 0,
  };
}

/**
 * Sort items by review priority
 * Priority: overdue items first, then by how overdue they are
 */
export function sortByReviewPriority<T extends { nextReviewDate?: string }>(
  items: T[],
  currentDate: Date = new Date()
): T[] {
  return [...items].sort((a, b) => {
    const dateA = a.nextReviewDate ? new Date(a.nextReviewDate).getTime() : 0;
    const dateB = b.nextReviewDate ? new Date(b.nextReviewDate).getTime() : 0;
    const now = currentDate.getTime();

    // Items without review date come first
    if (!a.nextReviewDate && !b.nextReviewDate) return 0;
    if (!a.nextReviewDate) return -1;
    if (!b.nextReviewDate) return 1;

    // Then sort by how overdue (most overdue first)
    const overdueA = now - dateA;
    const overdueB = now - dateB;

    return overdueB - overdueA;
  });
}
