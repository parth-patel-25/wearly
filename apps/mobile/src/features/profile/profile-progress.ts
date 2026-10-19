/**
 * Profile completion.
 *
 * Only steps the app can actually complete count, which is why the listing
 * step is gone: listing is an optional marketplace action and its flow does not
 * exist yet, so treating it as an unfinished profile requirement capped
 * completion below 100% forever. Every remaining step is achievable today, so
 * the bar can honestly reach 100%.
 *
 * The two personalisation answers come from the existing `SessionProvider`
 * reducer. This module reads them; it never duplicates or mutates them.
 */

export interface ProfileState {
  isAuthenticated: boolean;
  stylingFor: string | null;
  wears: string | null;
}

export interface ProfileStep {
  done: (state: ProfileState) => boolean;
  label: string;
}

export const PROFILE_STEPS: readonly ProfileStep[] = [
  {
    done: (state) => state.isAuthenticated,
    label: "Create your account",
  },
  {
    done: (state) => state.stylingFor !== null,
    label: "Tell us who you are styling",
  },
  {
    done: (state) => state.wears !== null,
    label: "Share what you wear",
  },
] as const;

export interface ProfileProgress {
  completed: number;
  nextStep: ProfileStep | null;
  percent: number;
  total: number;
}

export function profileProgress(state: ProfileState): ProfileProgress {
  const total = PROFILE_STEPS.length;
  const completed = PROFILE_STEPS.filter((step) => step.done(state)).length;

  return {
    completed,
    nextStep: PROFILE_STEPS.find((step) => !step.done(state)) ?? null,
    percent: Math.round((completed / total) * 100),
    total,
  };
}
