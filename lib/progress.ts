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

        const today = getToday();
        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newCompleted = [...state.completedLessons, slug];
        const newXP = state.xp + 10;
        const newReviewedAt = {
          ...state.reviewedAt,
          [slug]: state.reviewedAt[slug] ?? { at: new Date().toISOString(), box: 0 },
        };

        set({
          completedLessons: newCompleted,
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: today,
          reviewedAt: newReviewedAt,
        });

        // Cloud sync if user logged in
        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, newCompleted, newStreak, newXP, today);
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
        const today = getToday();
        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newCheckpoints = [...done, moduleSlug];
        const newXP = state.xp + XP_VALUES.CHECKPOINT_COMPLETE;

        set({
          completedCheckpoints: newCheckpoints,
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: today,
          reviewedAt: {
            ...state.reviewedAt,
            [key]: { at: new Date().toISOString(), box: 0 },
          },
        });

        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, state.completedLessons, newStreak, newXP, today);
          }
        }
      },

      addXP: (amount: number) => {
        const state = get();
        const today = getToday();
        const newStreak = calculateStreak(state.lastActivity, state.streak);
        const newXP = state.xp + amount;

        set({
          xp: newXP,
          streak: newStreak,
          maxStreak: Math.max(state.maxStreak, newStreak),
          lastActivity: today,
        });

        if (typeof window !== 'undefined') {
          const activeUserId = localStorage.getItem('sql-mastery-active-user-id');
          if (activeUserId) {
            syncProgressToCloud(activeUserId, state.completedLessons, newStreak, newXP, today);
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
  xp: number,
  lastActivity?: string
) {
  if (!userId) return;
  const today = lastActivity || useProgressStore.getState().lastActivity || getToday();
  try {
    const { error } = await supabase.from('user_progress').upsert({
      user_id: userId,
      completed_lessons: completedLessons,
      streak_count: streak,
      xp: xp,
      last_activity: today,
      updated_at: new Date().toISOString(),
    });
    // Fallback if last_activity column does not exist in Supabase yet
    if (error && error.message?.includes('last_activity')) {
      await supabase.from('user_progress').upsert({
        user_id: userId,
        completed_lessons: completedLessons,
        streak_count: streak,
        xp: xp,
        updated_at: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn('Failed to sync user progress to Supabase:', err);
  }
}

// Merge browser's saved lessons with cloud lessons (combine both, never overwrite)
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
    let cloudLastActivity = '';

    if (data) {
      cloudLessons = Array.isArray(data.completed_lessons) ? data.completed_lessons : [];
      cloudStreak = data.streak_count ?? 0;
      cloudXP = data.xp ?? 0;
      cloudLastActivity = data.last_activity ?? (data.updated_at ? data.updated_at.split('T')[0] : '');
    }

    // Merge: Combine arrays uniquely without overwriting
    const mergedLessons = Array.from(new Set([...cloudLessons, ...localState.completedLessons]));
    const mergedStreak = Math.max(cloudStreak, localState.streak);
    const mergedXP = Math.max(cloudXP, localState.xp);
    const mergedLastActivity = localState.lastActivity || cloudLastActivity || getToday();

    useProgressStore.setState({
      completedLessons: mergedLessons,
      streak: mergedStreak,
      maxStreak: Math.max(localState.maxStreak, mergedStreak),
      xp: mergedXP,
      lastActivity: mergedLastActivity,
    });

    // Save merged state back to cloud DB
    try {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: userId,
        completed_lessons: mergedLessons,
        streak_count: mergedStreak,
        xp: mergedXP,
        last_activity: mergedLastActivity,
        updated_at: new Date().toISOString(),
      });
      if (error && error.message?.includes('last_activity')) {
        await supabase.from('user_progress').upsert({
          user_id: userId,
          completed_lessons: mergedLessons,
          streak_count: mergedStreak,
          xp: mergedXP,
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      /* ignore cloud error */
    }
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
  { name: 'Novice', threshold: 0, next: 600, blurb: 'SELECT, WHERE, ORDER BY. You can read a table.' },
  { name: 'Data Analyst', threshold: 600, next: 1800, blurb: 'GROUP BY, HAVING, aggregates. You can answer questions without Excel.' },
  { name: 'BI Developer', threshold: 1800, next: 3600, blurb: 'JOINs, subqueries, CTEs. You can stitch tables together cleanly.' },
  { name: 'Query Architect', threshold: 3600, next: 5400, blurb: 'Window functions, optimization, ranking. PARTITION BY over self-joins.' },
  { name: 'Database Engineer', threshold: 5400, next: null, blurb: 'You ship SQL other people read.' },
];

export function getRank(xp: number): Rank {
  let current = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.threshold) current = r;
  }
  return current;
}

export function getRankLadder(): Rank[] {
  return RANKS;
}
