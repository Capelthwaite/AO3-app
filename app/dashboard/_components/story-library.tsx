"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { StoryLibrarySkeleton } from "@/components/ui/story-card-skeleton";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UI_LIMITS, CONFIRMATION_MESSAGES, LOADING_STATES, ARIA_LABELS } from "@/constants/ui-config";
import { formatDate } from "@/lib/date-utils";

// Helper function to clean up relationship names by removing full character names
function cleanRelationshipName(relationship: string): string {
  return relationship
    // Remove common full names and keep first names only
    .replace(/\b\w+\s+Danvers/g, match => {
      const firstName = match.split(' ')[0];
      return ['Kara', 'Alex'].includes(firstName) ? firstName : match;
    })
    .replace(/\bLena Luthor\b/g, 'Lena')
    .replace(/\bMaggie Sawyer\b/g, 'Maggie')
    .replace(/\bSamantha "Sam" Arias\b/g, 'Sam')
    .replace(/\bCat Grant\b/g, 'Cat')
    .replace(/\bWinn Schott Jr\./g, 'Winn')
    .replace(/\bJames "Jimmy" Olsen\b/g, 'James')
    .replace(/\bMon-El\b/g, 'Mon-El')
    .replace(/\bClark Kent\b/g, 'Clark')
    .replace(/\bLois Lane\b/g, 'Lois')
    // Handle Arcane characters
    .replace(/\bJinx\b \([^)]+\)/g, 'Jinx')
    .replace(/\bVi\b \([^)]+\)/g, 'Vi')
    .replace(/\bCaitlyn\b \([^)]+\)/g, 'Caitlyn')
    .replace(/\bEkko\b \([^)]+\)/g, 'Ekko')
    .replace(/\bJayce\b \([^)]+\)/g, 'Jayce')
    .replace(/\bViktor\b \([^)]+\)/g, 'Viktor')
    .replace(/\bMel Medarda\b/g, 'Mel')
    // Generic cleanup for other fandoms - keep first name before space
    .replace(/\b(\w+)\s+\w+(?:\s+\w+)*/g, (match, firstName) => {
      // Only apply to names that look like "FirstName LastName" pattern
      if (match.includes('/') || match.includes('&')) return match;
      return firstName;
    })
    .trim();
}

// Helper function to generate badge text for new chapters
function getNewChapterBadgeText(readingProgress: ReadingProgress): string {
  const { newChaptersSinceLastRead, newChaptersInfo } = readingProgress;
  
  if (newChaptersSinceLastRead === 0) return '0 new';
  if (newChaptersSinceLastRead === 1) return '1 new';
  
  // For multiple chapters, try to show range if we have chapter info
  if (newChaptersInfo && newChaptersInfo.firstChapter && newChaptersInfo.lastChapter) {
    if (newChaptersInfo.firstChapter === newChaptersInfo.lastChapter) {
      return `1 new`;
    } else {
      return `${newChaptersInfo.count} new`;
    }
  }
  
  return `${newChaptersSinceLastRead} new`;
}

// Helper function to generate chapter range text for the progress indicator
function getChapterRangeText(readingProgress: ReadingProgress): string {
  const { newChaptersSinceLastRead, newChaptersInfo } = readingProgress;
  
  if (newChaptersSinceLastRead === 0) return '';
  
  if (newChaptersInfo && newChaptersInfo.firstChapter && newChaptersInfo.lastChapter) {
    if (newChaptersInfo.firstChapter === newChaptersInfo.lastChapter) {
      return `Chapter ${newChaptersInfo.firstChapter}`;
    } else {
      return `Chapters ${newChaptersInfo.firstChapter}-${newChaptersInfo.lastChapter}`;
    }
  }
  
  // Fallback to generic message
  return newChaptersSinceLastRead === 1 ? 'New chapter available' : `${newChaptersSinceLastRead} new chapters`;
}

interface ReadingProgress {
  chaptersReadWhenSaved: number;
  chaptersReadWhenLastOpened: number;
  currentChapters: number;
  totalChapters: number;
  newChaptersSinceLastRead: number;
  hasUnreadUpdates: boolean;
  readProgress: number; // Percentage
  isFullyRead: boolean;
  lastOpenedAt: string | null;
  newChaptersInfo?: {
    count: number;
    firstChapter: number;
    lastChapter: number;
    chapters: Array<{
      chapterNumber: number;
      chapterTitle: string;
      publishedDate: string;
    }>;
  } | null;
}

interface SavedStory {
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

type ReadingStatusFilter = 'all' | 'unread' | 'caught-up';
type CompletionStatusFilter = 'all' | 'complete' | 'incomplete';
type SortOption = 'unread-first' | 'date-added' | 'last-updated';

interface StoriesResponse {
  stories: SavedStory[];
  pagination: {
    page: number;
    limit: number;
    totalStories: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

async function fetchStories(page: number = 1, limit: number = 25): Promise<StoriesResponse> {
  const response = await fetch(`/api/stories?page=${page}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stories');
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch stories');
  }
  return {
    stories: result.stories,
    pagination: result.pagination
  };
}

export function StoryLibrary() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  
  const { data: response, isLoading } = useQuery({
    queryKey: ['stories', currentPage],
    queryFn: () => fetchStories(currentPage, pageSize),
  });

  const stories = response?.stories || [];
  const pagination = response?.pagination;
  
  // Debug: Log some key info for comparison with calendar
  if (process.env.NODE_ENV === 'development' && stories.length > 0) {
    const augustStories = stories.filter(story => {
      const formatted = formatDate(story.lastUpdatedDate);
      return formatted.includes('Aug') && formatted.includes('2025');
    });
    console.log(`Story Library (page ${currentPage}): Found ${augustStories.length} August stories out of ${stories.length} total`);
  }

  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  const [expandedRelationships, setExpandedRelationships] = useState<Set<string>>(new Set());
  const [readingStatusFilter, setReadingStatusFilter] = useState<ReadingStatusFilter>('all');
  const [completionStatusFilter, setCompletionStatusFilter] = useState<CompletionStatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('unread-first');
  const [refreshing, setRefreshing] = useState(false);
  const [deletingStory, setDeletingStory] = useState<string | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    storyId: string;
    storyTitle: string;
  }>({
    open: false,
    storyId: '',
    storyTitle: '',
  });


  const toggleSummary = (storyId: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedSummaries(newExpanded);
  };

  const toggleRelationships = (storyId: string) => {
    const newExpanded = new Set(expandedRelationships);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedRelationships(newExpanded);
  };

  const getSummaryLines = useCallback((summary: string) => {
    if (!summary) return false;
    
    // More conservative estimation - only show "Show more" for text that would clearly be 4+ lines
    // Account for typical word length, spaces, and line breaks
    const avgCharsPerLine = 80; // More generous chars per line for modern responsive layouts
    const maxCharsForFourLines = avgCharsPerLine * 4; // Only show expand for 4+ lines worth
    
    // Also consider if there are explicit line breaks
    const lineBreaks = (summary.match(/\n/g) || []).length;
    
    // Show expand if: text is significantly long OR has more than 3 line breaks (would create 4+ visual lines)
    return summary.length > maxCharsForFourLines || lineBreaks > 3;
  }, []);

  const handleReadOnAO3 = useCallback(async (workId: string) => {
    try {
      // Mark story as read when user clicks the AO3 link
      await fetch('/api/stories/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workId }),
      });

      // Update cache to reflect the change
      queryClient.setQueryData(['stories'], (oldStories: SavedStory[] | undefined) => 
        oldStories ? oldStories.map(story => 
          story.workId === workId 
            ? {
                ...story,
                readingProgress: {
                  ...story.readingProgress,
                  chaptersReadWhenLastOpened: story.currentChapters,
                  hasUnreadUpdates: false,
                  newChaptersSinceLastRead: 0,
                  isFullyRead: true,
                  lastOpenedAt: new Date().toISOString(),
                }
              }
            : story
        ) : []
      );

      // Also invalidate stats to update counts
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    } catch (error) {
      console.error('Error marking story as read:', error);
    }
  }, [queryClient]);

  const handleDeleteStory = useCallback((storyId: string, storyTitle: string) => {
    setConfirmationDialog({
      open: true,
      storyId,
      storyTitle,
    });
  }, []);

  const confirmDeleteStory = useCallback(async () => {
    const { storyId } = confirmationDialog;
    setDeletingStory(storyId);

    try {
      // Optimistic update: remove story from cache immediately
      queryClient.setQueryData(['stories'], (oldStories: SavedStory[] | undefined) => 
        oldStories ? oldStories.filter(story => story.id !== storyId) : []
      );

      const response = await fetch(`/api/stories?storyId=${storyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Story removed from library');
        // Invalidate related queries to ensure consistency
        queryClient.invalidateQueries({ queryKey: ['stats'] });
      } else {
        throw new Error(result.error || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      // Revert the optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast.error('Failed to remove story from library');
    } finally {
      setDeletingStory(null);
    }
  }, [confirmationDialog, queryClient]);

  // Filter and sort stories with memoization for performance
  const filteredAndSortedStories = useMemo(() => {
    if (!stories || stories.length === 0) return [];
    return [...stories]
      .filter(story => {
        // Filter by reading status
        if (readingStatusFilter === 'unread' && !story.readingProgress.hasUnreadUpdates) return false;
        if (readingStatusFilter === 'caught-up' && story.readingProgress.hasUnreadUpdates) return false;
        
        // Filter by completion status
        if (completionStatusFilter === 'complete' && !story.isComplete) return false;
        if (completionStatusFilter === 'incomplete' && story.isComplete) return false;
        
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'unread-first') {
          // First priority: unread stories
          if (a.readingProgress.hasUnreadUpdates && !b.readingProgress.hasUnreadUpdates) return -1;
          if (!a.readingProgress.hasUnreadUpdates && b.readingProgress.hasUnreadUpdates) return 1;
          
          // Second priority: most recently updated
          return new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime();
        } else if (sortOption === 'date-added') {
          // Sort by date added (savedAt), newest first
          return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        } else if (sortOption === 'last-updated') {
          // Sort by last updated date, newest first
          return new Date(b.lastUpdatedDate).getTime() - new Date(a.lastUpdatedDate).getTime();
        }
        return 0;
      });
  }, [stories, readingStatusFilter, completionStatusFilter, sortOption]);

  const unreadCount = useMemo(() => 
    stories ? stories.filter(story => story.readingProgress.hasUnreadUpdates).length : 0,
    [stories]
  );

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">Loading your saved stories...</p>
        </div>
        <StoryLibrarySkeleton />
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">My Library</h1>
          <p className="text-muted-foreground">Your saved stories will appear here once you add some!</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No stories in your library yet.</p>
          <p className="text-sm mt-2">Add your first story using the browse page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col items-start justify-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">My Library</h1>
        </div>
        <p className="text-muted-foreground">
          {filteredAndSortedStories.length.toLocaleString()} of {pagination?.totalStories?.toLocaleString() || stories.length.toLocaleString()} {stories.length === 1 ? "story" : "stories"} shown
          {unreadCount > 0 && ` • ${unreadCount.toLocaleString()} with new chapters`}
        </p>
        
        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Reading Status:</label>
            <Select value={readingStatusFilter} onValueChange={(value: ReadingStatusFilter) => setReadingStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stories</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="caught-up">Caught Up</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Status:</label>
            <Select value={completionStatusFilter} onValueChange={(value: CompletionStatusFilter) => setCompletionStatusFilter(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stories</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Sort by:</label>
            <Select value={sortOption} onValueChange={(value: SortOption) => setSortOption(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unread-first">Unread First</SelectItem>
                <SelectItem value="date-added">Date Added</SelectItem>
                <SelectItem value="last-updated">Last Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={!pagination.hasPreviousPage}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
              >
                Previous
              </Button>
            </div>
            
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Stories */}
      <div className="space-y-6">
        {filteredAndSortedStories.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No stories match the selected filters.</p>
            <p className="text-sm mt-2">Try adjusting your filter selection.</p>
          </div>
        ) : (
          filteredAndSortedStories.map((story) => {
            const isExpanded = expandedSummaries.has(story.id);
            const isRelationshipsExpanded = expandedRelationships.has(story.id);
            const needsExpansion = story.summary && getSummaryLines(story.summary);
            
            return (
              <div key={story.id} className={`card-enhanced p-6 ${story.readingProgress.hasUnreadUpdates ? 'ring-2 ring-emerald-200 ring-offset-2' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg leading-tight">{story.title}</h3>
                      {story.readingProgress.hasUnreadUpdates && (
                        <Badge className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 border-green-300">
                          {getNewChapterBadgeText(story.readingProgress)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">by {story.author}</p>
                    
                    {/* Reading Progress Indicator - Enhanced with specific chapter info */}
                    {story.readingProgress.hasUnreadUpdates && (
                      <div className="text-xs font-medium mt-2 px-2 py-1 bg-emerald-50/50 rounded border-l-2 border-l-emerald-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-700 text-xs">
                            {getChapterRangeText(story.readingProgress)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="ml-6 shrink-0 flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground font-medium">
                      Updated {formatDate(story.lastUpdatedDate)}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteStory(story.id, story.title)}
                        disabled={deletingStory === story.id}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={ARIA_LABELS.DELETE_STORY}
                      >
                        {deletingStory === story.id ? LOADING_STATES.DELETING : '🗑'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          handleReadOnAO3(story.workId);
                          // Open the link after marking as read
                          window.open(story.url, '_blank', 'noopener,noreferrer');
                        }}
                        aria-label={ARIA_LABELS.READ_STORY}
                      >
                        Read on AO3 ↗
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Fandom and Relationship Badges */}
                {(story.fandom.length > 0 || story.relationships.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {/* Fandom Badges */}
                    {story.fandom.slice(0, UI_LIMITS.INITIAL_FANDOM_BADGES).map((fandom, index) => (
                      <Badge key={`fandom-${index}`} variant="secondary" className="text-xs px-3 py-1 font-medium bg-muted/50">
                        {fandom}
                      </Badge>
                    ))}
                    {story.fandom.length > UI_LIMITS.INITIAL_FANDOM_BADGES && (
                      <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
                        +{story.fandom.length - UI_LIMITS.INITIAL_FANDOM_BADGES} more fandoms
                      </Badge>
                    )}
                    
                    {/* Relationship Badges */}
                    {(isRelationshipsExpanded ? story.relationships : story.relationships.slice(0, UI_LIMITS.INITIAL_RELATIONSHIP_BADGES)).map((relationship, index) => (
                      <Badge key={`rel-${index}`} variant="outline" className="text-xs px-3 py-1 font-medium bg-background">
                        {cleanRelationshipName(relationship)}
                      </Badge>
                    ))}
                    {story.relationships.length > UI_LIMITS.INITIAL_RELATIONSHIP_BADGES && (
                      <button
                        onClick={() => toggleRelationships(story.id)}
                        className="text-xs font-medium px-3 py-1 rounded-md border border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                      >
                        {isRelationshipsExpanded 
                          ? 'Show less' 
                          : `+${story.relationships.length - UI_LIMITS.INITIAL_RELATIONSHIP_BADGES} more relationships`
                        }
                      </button>
                    )}
                  </div>
                )}

                {story.summary && (
                  <div className="mb-4">
                    <div 
                      className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}
                    >
                      {story.summary.replace(/\n+/g, ' ').trim()}
                    </div>
                    {needsExpansion && (
                      <button
                        onClick={() => toggleSummary(story.id)}
                        className="text-xs text-purple-600 hover:text-purple-700 mt-2 font-medium hover:underline"
                      >
                        {isExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <span className="font-medium">{story.wordCount.toLocaleString()} words</span>
                  
                  {/* Chapter Progress - Show current/total chapters */}
                  <span className={story.readingProgress.hasUnreadUpdates ? 'font-semibold text-blue-600' : 'font-medium'}>
                    {story.currentChapters.toLocaleString()}/{story.totalChapters?.toLocaleString() || "?"} chapters
                  </span>
                  
                  <span className="font-medium">{story.isComplete ? "✅ Complete" : "⏳ In Progress"}</span>
                  <span className="font-medium">👍 {story.kudos.toLocaleString()}</span>
                  
                  {story.readingProgress.lastOpenedAt && (
                    <span className="font-medium">
                      Last read {formatDate(story.readingProgress.lastOpenedAt)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Story Deletion */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, open }))}
        title={CONFIRMATION_MESSAGES.DELETE_STORY.getTitle(confirmationDialog.storyTitle)}
        description={CONFIRMATION_MESSAGES.DELETE_STORY.getDescription(confirmationDialog.storyTitle)}
        confirmText={CONFIRMATION_MESSAGES.DELETE_STORY.confirmText}
        cancelText={CONFIRMATION_MESSAGES.DELETE_STORY.cancelText}
        variant="destructive"
        onConfirm={confirmDeleteStory}
        loading={deletingStory === confirmationDialog.storyId}
      />
    </div>
  );
}