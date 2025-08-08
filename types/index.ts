// Centralized type definitions for the AO3 fanfiction app

// Search filters interface for UI components (with defaults)
export interface SearchFilters {
  query: string;
  fandoms: string[]; 
  characters: string[]; 
  complete: string;
  words_from: string;
  words_to: string;
  kudos_from: string;
  sort_column: string;
  page: number;
}

// API search filters interface (all optional for API calls)
export interface ApiSearchFilters {
  query?: string;
  fandom?: string | string[]; // Support both single and multiple fandoms  
  fandoms?: string[]; // Alternative property name used in some components
  characters?: string[]; // Support multiple characters
  complete?: 'true' | 'false' | '';
  words_from?: string;
  words_to?: string;
  kudos_from?: string;
  sort_column?: 'revised_at' | 'kudos_count' | 'hits' | 'bookmarks_count' | 'comments_count';
  page?: string | number; // Support both string and number for page
}

// Helper function to get fandoms array from API filters
export function getFandomsArray(filters: ApiSearchFilters): string[] {
  return filters.fandoms || (Array.isArray(filters.fandom) ? filters.fandom : filters.fandom ? [filters.fandom] : []);
}

// Saved filter interface for user-created filter sets
export interface SavedFilter {
  id: string;
  name: string;
  description?: string;
  filters: ApiSearchFilters; // Use the API-compatible filters interface
  isPinned: boolean;
  useCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Filter set interface for API responses
export interface SavedFilterSet {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  isPinned: boolean;
  useCount: number;
  lastUsed: string | null;
  createdAt: string;
  updatedAt: string;
}

// Reading progress interface for story tracking
export interface ReadingProgress {
  chaptersReadWhenSaved: number;
  chaptersReadWhenLastOpened: number;
  currentChapters: number;
  totalChapters: number;
  newChaptersSinceLastRead: number;
  hasUnreadUpdates: boolean;
  readProgress: number; // Percentage
  isFullyRead: boolean;
  lastOpenedAt: string | null;
}

// Story interface for saved stories
export interface SavedStory {
  id: string;
  workId: string;
  title: string;
  author: string;
  summary: string;
  wordCount: number;
  currentChapters: number;
  totalChapters: number | null;
  isComplete: boolean;
  fandom: string[];
  relationships: string[];
  characters: string[];
  additionalTags: string[];
  publishedDate: string;
  lastUpdatedDate: string;
  kudos: number;
  bookmarks: number;
  hits: number;
  url: string;
  savedAt: string;
  updatedAt: string;
  readingProgress: ReadingProgress;
}