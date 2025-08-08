"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { StoryLibrarySkeleton } from "@/components/ui/story-card-skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UI_LIMITS, CONFIRMATION_MESSAGES, LOADING_STATES, ARIA_LABELS } from "@/constants/ui-config";

// Helper function to format dates consistently as DD Mon YYYY with enhanced parsing
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Date unavailable';
  
  // Handle known bad values
  if (dateString === 'Unknown' || dateString === '' || dateString.toLowerCase().includes('unavailable')) {
    return 'Date unavailable';
  }
  
  try {
    // Clean up common AO3 date prefixes and extra whitespace
    const cleanedDate = dateString.replace(/^(Updated:|Last updated:|Published:)\s*/i, '').trim();
    
    // If it's already in DD Mon YYYY format, return as is
    if (/^\d{1,2}\s+\w{3}\s+\d{4}$/.test(cleanedDate)) {
      return cleanedDate;
    }
    
    // Handle ISO date format (YYYY-MM-DD) - our standard storage format
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
      const [year, month, day] = cleanedDate.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(month) - 1];
      if (monthName) {
        return `${parseInt(day)} ${monthName} ${year}`;
      }
    }
    
    // Handle DD Mon YYYY format with extra spacing
    const ddMonYyyyMatch = cleanedDate.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
    if (ddMonYyyyMatch) {
      const [, day, month, year] = ddMonYyyyMatch;
      return `${parseInt(day)} ${month} ${year}`;
    }
    
    // Handle Mon DD, YYYY format
    const monDdYyyyMatch = cleanedDate.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
    if (monDdYyyyMatch) {
      const [, month, day, year] = monDdYyyyMatch;
      return `${parseInt(day)} ${month} ${year}`;
    }
    
    // Handle full month names (January 12, 2023)
    const fullMonthMatch = cleanedDate.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/);
    if (fullMonthMatch) {
      const [, fullMonth, day, year] = fullMonthMatch;
      const monthMap = {
        'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'April': 'Apr',
        'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug',
        'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec'
      };
      const shortMonth = monthMap[fullMonth as keyof typeof monthMap];
      if (shortMonth) {
        return `${parseInt(day)} ${shortMonth} ${year}`;
      }
    }
    
    // Try to parse as a JavaScript date as last resort
    const date = new Date(cleanedDate);
    if (!isNaN(date.getTime())) {
      // Validate it's a reasonable date
      if (date.getFullYear() >= 2008 && date.getFullYear() <= new Date().getFullYear() + 1) {
        return date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short', 
          year: 'numeric'
        });
      }
    }
    
    // If we get here, we couldn't parse it
    console.warn(`Could not format date string: "${dateString}" (cleaned: "${cleanedDate}")`);
    return 'Date unavailable';
    
  } catch (error) {
    console.error(`Error formatting date "${dateString}":`, error);
    return 'Date unavailable';
  }
}

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

export function StoryLibrary() {
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    async function fetchStories() {
      try {
        const response = await fetch("/api/stories");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStories(result.stories);
          }
        }
      } catch (error) {
        console.error("Error fetching stories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

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

  const getSummaryLines = (summary: string) => {
    if (!summary) return false;
    
    // More accurate estimation for when line-clamp-2 will actually truncate
    // Account for typical word length, spaces, and line breaks
    const avgCharsPerLine = 60; // More realistic for responsive text
    const maxCharsForTwoLines = avgCharsPerLine * 2;
    
    // Also consider if there are explicit line breaks
    const lineBreaks = (summary.match(/\n/g) || []).length;
    
    // Show expand if: text is long OR has more than 1 line break (would create 2+ visual lines)
    return summary.length > maxCharsForTwoLines || lineBreaks > 1;
  };

  const handleReadOnAO3 = async (workId: string) => {
    try {
      // Mark story as read when user clicks the AO3 link
      await fetch('/api/stories/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workId }),
      });

      // Update local state to reflect the change
      setStories(prev => 
        prev.map(story => 
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
        )
      );
    } catch (error) {
      console.error('Error marking story as read:', error);
    }
  };

  const handleDeleteStory = (storyId: string, storyTitle: string) => {
    setConfirmationDialog({
      open: true,
      storyId,
      storyTitle,
    });
  };

  const confirmDeleteStory = async () => {
    const { storyId } = confirmationDialog;
    setDeletingStory(storyId);

    // Optimistically remove the story from local state for immediate UI feedback
    const previousStories = stories;
    setStories(prev => prev.filter(story => story.id !== storyId));

    try {
      const response = await fetch(`/api/stories?storyId=${storyId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Story removed from library');
      } else {
        throw new Error(result.error || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      // Revert the optimistic update on error
      setStories(previousStories);
      toast.error('Failed to remove story from library');
    } finally {
      setDeletingStory(null);
    }
  };

  if (loading) {
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

  // Filter and sort stories
  const filteredAndSortedStories = [...stories]
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

  const unreadCount = stories.filter(story => story.readingProgress.hasUnreadUpdates).length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col items-start justify-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">My Library</h1>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={refreshing}
            onClick={async () => {
              setRefreshing(true);
              try {
                console.log('Starting date refresh...');
                const response = await fetch('/api/stories/refresh-dates', { 
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log('Refresh response:', result);
                
                if (result.success) {
                  const message = result.errors && result.errors.length > 0 
                    ? `Refreshed ${result.refreshedCount} stories successfully. ${result.errors.length} had issues - check console for details.`
                    : `Successfully refreshed dates for ${result.refreshedCount} stories!`;
                  
                  alert(message);
                  
                  if (result.errors) {
                    console.warn('Refresh errors:', result.errors);
                  }
                  
                  // Only reload if we actually refreshed some stories
                  if (result.refreshedCount > 0) {
                    window.location.reload();
                  }
                } else {
                  throw new Error(result.error || 'Unknown refresh error');
                }
              } catch (error) {
                console.error('Refresh error:', error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                alert(`Error during refresh: ${errorMessage}`);
              } finally {
                setRefreshing(false);
              }
            }}
          >
            {refreshing ? 'Refreshing...' : 'Refresh Dates'}
          </Button>
        </div>
        <p className="text-muted-foreground">
          {filteredAndSortedStories.length.toLocaleString()} of {stories.length.toLocaleString()} {stories.length === 1 ? "story" : "stories"} shown
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
                          {story.readingProgress.newChaptersSinceLastRead} new
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">by {story.author}</p>
                    
                    {/* Reading Progress Indicator - More subtle */}
                    {story.readingProgress.hasUnreadUpdates && (
                      <div className="text-xs font-medium mt-2 px-2 py-1 bg-emerald-50/50 rounded border-l-2 border-l-emerald-400">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          <span className="text-emerald-700 text-xs">
                            {story.readingProgress.newChaptersSinceLastRead > 1 ? 
                              `Chapters ${(story.readingProgress.chaptersReadWhenLastOpened + 1).toLocaleString()}-${story.currentChapters.toLocaleString()}` :
                              'New chapter available'
                            }
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
                      className={`text-sm text-muted-foreground leading-relaxed ${!isExpanded && needsExpansion ? 'line-clamp-2' : ''}`}
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