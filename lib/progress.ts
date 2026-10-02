import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

// Spaced repetition: a completed lesson is due immediately, then the gap
// widens each time it's reviewed: +1d -> +3d -> +7d -> +16d -> +35d.
const DAY = 86_400_000;
export const SRS_INTERVALS_DAYS = [1, 3, 7, 16, 35];

export interface ReviewState {
  at: string;
  box: number;
}

function normalizeReview(v: ReviewState | string | undefined): ReviewState | null {
  if (!v) return null;
  if (typeof v === 'string') return { at: v, box: 0 };
  if (typeof v.at === 'string' && typeof v.box === 'number') return v;
  return null;
}

export function isLessonDue(
  slug: string,
  reviewedAt: Record<string, ReviewState | string>,
): boolean {
  const r = normalizeReview(reviewedAt[slug]);
  if (!r) return true;
  return Date.now() >= new Date(r.at).getTime() + SRS_INTERVALS_DAYS[r.box] * DAY;
}

export function getDueLessons(
  completed: string[],
  reviewedAt: Record<string, ReviewState | string>,
): string[] {
  return completed.filter((s) => isLessonDue(s, reviewedAt));
}

interface ProgressState {
  completedLessons: string[];
  completedCheckpoints: string[];
  xp: number;
  streak: number;
  maxStreak: number;
  lastActivity: string;
  reviewedAt: Record<string, ReviewState>;

  completeLesson: (slug: string) => void;
  completeCheckpoint: (moduleSlug: string) => void;
  addXP: (amount: number) => void;
  markReviewed: (slug: string) => void;
  isLessonCompleted: (slug: string) => boolean;
  isCheckpointCompleted: (moduleSlug: string) => boolean;
  getModuleProgress: (moduleSlug: string, totalLessons: number) => number;
  resetProgress: () => void;
}

// Spaced-review key for a module checkpoint (kept distinct from lesson keys).
export const checkpointKey = (moduleSlug: string): string => `checkpoint:${moduleSlug}`;

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const calculateStreak = (lastActivity: string, currentStreak: number): number => {
  const today = getToday();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActivity === today) {
    return currentStreak;
  } else if (lastActivity === yesterdayStr) {
    return currentStreak + 1;
  } else if (!lastActivity) {
    return 1;
  } else {
    return 1;
  }
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: [],
      completedCheckpoints: [],
      xp: 0,
      streak: 0,
      maxStreak: 0,
      lastActivity: '',
      reviewedAt: {},

      completeLesson: (slug: string) => {
        const state = get();

        if (state.completedLessons.includes(slug)) {
          return;
        }

        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newCompleted = [...state.completedLessons, slug];
        const newXP = state.xp + 10;

        set({
          completedLessons: newCompleted,
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: getToday(),
        });

        // Cloud sync if user logged in
        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, newCompleted, newStreak, newXP);
          }
        }
      },

      completeCheckpoint: (moduleSlug: string) => {
        const key = checkpointKey(moduleSlug);
        const state = get();
        const done = state.completedCheckpoints ?? [];
        if (done.includes(moduleSlug)) {
          get().markReviewed(key);
          return;
        }
        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newCheckpoints = [...done, moduleSlug];
        const newXP = state.xp + XP_VALUES.CHECKPOINT_COMPLETE;

        set({
          completedCheckpoints: newCheckpoints,
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: getToday(),
          reviewedAt: {
            ...state.reviewedAt,
            [key]: { at: new Date().toISOString(), box: 0 },
          },
        });

        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, state.completedLessons, newStreak, newXP);
          }
        }
      },

      addXP: (amount: number) => {
        const state = get();
        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newXP = state.xp + amount;

        set({
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: getToday(),
        });

        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, state.completedLessons, newStreak, newXP);
          }
        }
      },

      markReviewed: (slug: string) => {
        const state = get();
        const cur = normalizeReview(state.reviewedAt[slug]);
        if (cur && !isLessonDue(slug, state.reviewedAt)) return;
        const nextBox = cur
          ? Math.min(cur.box + 1, SRS_INTERVALS_DAYS.length - 1)
          : 0;
        set({
          reviewedAt: {
            ...state.reviewedAt,
            [slug]: { at: new Date().toISOString(), box: nextBox },
          },
        });
      },

      isLessonCompleted: (slug: string) => {
        return get().completedLessons.includes(slug);
      },

      isCheckpointCompleted: (moduleSlug: string) => {
        return (get().completedCheckpoints ?? []).includes(moduleSlug);
      },

      getModuleProgress: (moduleSlug: string, totalLessons: number) => {
        const completedInModule = get().completedLessons.filter(
          slug => slug.startsWith(`${moduleSlug}/`)
        ).length;

        if (totalLessons === 0) return 0;
        return Math.round((completedInModule / totalLessons) * 100);
      },

      resetProgress: () => {
        set({
          completedLessons: [],
          completedCheckpoints: [],
          xp: 0,
          streak: 0,
          maxStreak: 0,
          lastActivity: '',
          reviewedAt: {},
        });
      },
    }),
    {
      name: 'sql-mastery-progress',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Cloud sync helper function
export async function syncProgressToCloud(
  userId: string,
  completedLessons: string[],
  streak: number,
  xp: number
) {
  if (!userId) return;
  try {
    await supabase.from('user_progress').upsert({
      user_id: userId,
      completed_lessons: completedLessons,
      streak_count: streak,
      xp: xp,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to sync user progress to Supabase:', err);
  }
}

// Requirement 2: Merge browser's saved lessons with cloud lessons (combine both, never overwrite)
export async function mergeCloudProgress(userId: string) {
  if (!userId) return;
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const localState = useProgressStore.getState();

    let cloudLessons: string[] = [];
    let cloudStreak = 0;
    let cloudXP = 0;

    if (data) {
      cloudLessons = Array.isArray(data.completed_lessons) ? data.completed_lessons : [];
      cloudStreak = data.streak_count ?? 0;
      cloudXP = data.xp ?? 0;
    }

    // Merge: Combine arrays uniquely without overwriting
    const mergedLessons = Array.from(new Set([...cloudLessons, ...localState.completedLessons]));
    const mergedStreak = Math.max(cloudStreak, localState.streak);
    const mergedXP = Math.max(cloudXP, localState.xp);

    useProgressStore.setState({
      completedLessons: mergedLessons,
      streak: mergedStreak,
      maxStreak: Math.max(localState.maxStreak, mergedStreak),
      xp: mergedXP,
    });

    // Save merged state back to cloud DB
    await supabase.from('user_progress').upsert({
      user_id: userId,
      completed_lessons: mergedLessons,
      streak_count: mergedStreak,
      xp: mergedXP,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to merge cloud progress:', err);
  }
}

export const XP_VALUES = {
  LESSON_COMPLETE: 10,
  CHALLENGE_COMPLETE: 25,
  FIRST_TRY_CHALLENGE: 40,
  STREAK_BONUS: 5,
  CHECKPOINT_COMPLETE: 30,
} as const;

export interface Rank {
  name: string;
  threshold: number;
  next: number | null;
  blurb: string;
}

const RANKS: Rank[] = [
  { name: 'select novice', threshold: 0, next: 100, blurb: 'SELECT, WHERE, ORDER BY. you can read a table.' },
  { name: 'data analyst', threshold: 100, next: 500, blurb: 'GROUP BY, HAVING, aggregates. you can answer a question without exporting to excel.' },
  { name: 'bi developer', threshold: 500, next: 1500, blurb: 'JOINs, subqueries, CTEs. you can stitch tables together without flattening to a giant view.' },
  { name: 'query architect', threshold: 1500, next: 4000, blurb: 'window functions, optimization, ranking. you reach for PARTITION BY before a self-join.' },
  { name: 'database engineer', threshold: 4000, next: null, blurb: 'all 68 lessons cleared. you ship sql other people read.' },
];

export const LESSON_RANKS: Rank[] = [
  { name: 'novice', threshold: 0, next: 17, blurb: 'Getting started & SQL fundamentals (Lessons 0–16).' },
  { name: 'apprentice', threshold: 17, next: 35, blurb: 'JOINs, aggregations, & Subqueries (Lessons 17–34).' },
  { name: 'practitioner', threshold: 35, next: 68, blurb: 'Window Functions, CTEs, & Objects (Lessons 35–67).' },
  { name: 'sql master', threshold: 68, next: null, blurb: 'All 68 lessons cleared! Official SQL Master.' },
];

export function getRank(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.threshold) current = r;
  }
  return current;
}

export function getRankByLessons(completedCount: number): Rank {
  let current = LESSON_RANKS[0];
  for (const r of LESSON_RANKS) {
    if (completedCount >= r.threshold) current = r;
  }
  return current;
}

export function getRankLadder(): Rank[] {
  return RANKS;
}
