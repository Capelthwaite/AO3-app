/**
 * UI Configuration Constants
 * Centralized configuration for consistent UI behavior across the application
 */

export const UI_LIMITS = {
  // Story display limits
  INITIAL_FANDOM_BADGES: 2,
  INITIAL_RELATIONSHIP_BADGES: 2,
  SUMMARY_LINE_CLAMP: 2,
  
  // Pagination and virtualization
  STORIES_PER_PAGE: 20,
  VIRTUAL_LIST_THRESHOLD: 100,
  
  // Loading and animation
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 4000,
  ANIMATION_DURATION: 200,
} as const;

export const UI_BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;

export const CONFIRMATION_MESSAGES = {
  DELETE_STORY: {
    getTitle: (title: string) => `Remove "${title}"?`,
    getDescription: (title: string) => 
      `Are you sure you want to remove "${title}" from your library? This action cannot be undone.`,
    confirmText: "Remove Story",
    cancelText: "Keep Story",
  },
} as const;

export const LOADING_STATES = {
  INITIAL: "Loading...",
  DELETING: "Removing...",
  SAVING: "Saving...",
  FETCHING: "Fetching...",
  UPDATING: "Updating...",
} as const;

export const ARIA_LABELS = {
  DELETE_STORY: "Delete story from library",
  READ_STORY: "Read story on AO3",
  EXPAND_SUMMARY: "Show full summary",
  COLLAPSE_SUMMARY: "Show less summary",
  EXPAND_RELATIONSHIPS: "Show all relationships", 
  COLLAPSE_RELATIONSHIPS: "Show fewer relationships",
} as const;