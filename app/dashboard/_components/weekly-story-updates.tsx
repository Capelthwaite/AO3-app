"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDate, parseDate, isSameDay } from "@/lib/date-utils";
import { getAO3ChapterUrl } from "@/lib/ao3-utils";
import { useState, useCallback } from "react";

interface CalendarEntry {
  date: string;
  storyCount: number;
  chapters: Array<{
    workId: string;
    title: string;
    author: string;
    chapterNumber: number;
    chapterTitle: string;
  }>;
  cachedAt: string;
}

interface StoryMetadata {
  id: string;
  workId: string;
  title: string;
  author: string;
  summary?: string;
  wordCount?: number;
  currentChapters: number;
  totalChapters?: number;
  isComplete: boolean;
  lastUpdatedDate: string;
  readingProgress?: {
    lastOpenedAt: string | null;
    chaptersReadWhenLastOpened: number;
    readProgress: number;
  };
}

interface CachedCalendarResponse {
  calendarData: CalendarEntry[];
  groupedByMonth: Record<string, CalendarEntry[]>;
  summary: {
    totalDates: number;
    totalStoryUpdates: number;
    totalChapterUpdates: number;
  };
  performance: {
    queryTimeMs: number;
    totalTimeMs: number;
    usedCache: boolean;
  };
}

async function fetchWeeklyUpdates(): Promise<CachedCalendarResponse> {
  const response = await fetch('/api/recent-updates/cached?limit=7');
  
  if (!response.ok) {
    throw new Error('Failed to fetch weekly updates');
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch weekly updates');
  }
  
  return result;
}

async function fetchAllStoriesThisWeek(): Promise<{
  storyMap: Map<string, StoryMetadata>;
  storiesUpdatedThisWeek: StoryMetadata[];
}> {
  const response = await fetch('/api/stories');
  
  if (!response.ok) {
    throw new Error('Failed to fetch story metadata');
  }
  
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch story metadata');
  }
  
  const storyMap = new Map<string, StoryMetadata>();
  const storiesUpdatedThisWeek: StoryMetadata[] = [];
  
  // Get start of current week (Sunday)
  const today = new Date();
  const startOfWeek = new Date(today);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  result.stories.forEach((story: any) => {
    const storyMetadata: StoryMetadata = {
      id: story.id,
      workId: story.workId,
      title: story.title,
      author: story.author,
      summary: story.summary,
      wordCount: story.wordCount,
      currentChapters: story.currentChapters,
      totalChapters: story.totalChapters,
      isComplete: story.isComplete,
      lastUpdatedDate: story.lastUpdatedDate,
      readingProgress: {
        lastOpenedAt: story.readingProgress?.lastOpenedAt || null,
        chaptersReadWhenLastOpened: story.readingProgress?.chaptersReadWhenLastOpened || 0,
        readProgress: story.readingProgress?.readProgress || 0,
      },
    };
    
    storyMap.set(story.workId, storyMetadata);
    
    // Check if this story was updated this week
    const lastUpdated = new Date(story.lastUpdatedDate);
    if (lastUpdated >= startOfWeek && lastUpdated <= today) {
      storiesUpdatedThisWeek.push(storyMetadata);
    }
  });
  
  return { storyMap, storiesUpdatedThisWeek };
}

// Get start of current week (Sunday)
function getStartOfWeek(date: Date): Date {
  const start = new Date(date);
  const day = start.getDay();
  const diff = start.getDate() - day;
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

// Get all days of current week up to today
function getWeekDays(): Date[] {
  const today = new Date();
  const startOfWeek = getStartOfWeek(today);
  const days = [];
  
  for (let i = 0; i <= today.getDay(); i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    if (day <= today) {
      days.push(day);
    }
  }
  
  return days.reverse(); // Most recent first
}

export function WeeklyStoryUpdates() {
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set());
  
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

  const toggleSummary = (storyId: string) => {
    const newExpanded = new Set(expandedSummaries);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedSummaries(newExpanded);
  };

  const { data: response, isLoading: isLoadingWeeklyUpdates, error } = useQuery({
    queryKey: ['my-week-updates'],
    queryFn: fetchWeeklyUpdates,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch all stories and identify which ones were updated this week
  const { data: allStoriesData, isLoading: isLoadingAllStories } = useQuery({
    queryKey: ['all-stories-this-week'],
    queryFn: fetchAllStoriesThisWeek,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const isLoading = isLoadingWeeklyUpdates || isLoadingAllStories;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-semibold tracking-tight">This Week's Updates</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
              <div className="space-y-2">
                <div className="h-32 bg-gray-100 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-semibold tracking-tight">This Week's Updates</h2>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get this week's days and merge calendar data with newly added stories
  const weekDays = getWeekDays();
  const updatesByDate = new Map<string, CalendarEntry>();
  
  if (response?.calendarData) {
    response.calendarData.forEach(entry => {
      const entryDate = parseDate(entry.date);
      updatesByDate.set(entryDate.toDateString(), entry);
    });
  }

  // Add newly added stories that were updated this week but not in calendar cache
  if (allStoriesData?.storiesUpdatedThisWeek) {
    allStoriesData.storiesUpdatedThisWeek.forEach(story => {
      const storyUpdateDate = new Date(story.lastUpdatedDate);
      const dateStr = storyUpdateDate.toDateString();
      
      // Only add if this date is within our week view
      const isWithinWeek = weekDays.some(day => day.toDateString() === dateStr);
      if (isWithinWeek) {
        const existingEntry = updatesByDate.get(dateStr);
        
        // Check if this story is already in the calendar entry for this date
        const storyAlreadyInCalendar = existingEntry?.chapters.some(chapter => chapter.workId === story.workId);
        
        if (!storyAlreadyInCalendar) {
          // Create a synthetic chapter entry for the story
          const syntheticChapter = {
            workId: story.workId,
            title: story.title,
            author: story.author,
            chapterNumber: story.currentChapters, // Use current chapter count as latest chapter
            chapterTitle: `Chapter ${story.currentChapters}`, // Generic title for latest chapter
          };
          
          if (existingEntry) {
            // Add to existing entry
            existingEntry.chapters.push(syntheticChapter);
            existingEntry.storyCount += 1;
          } else {
            // Create new entry for this date
            updatesByDate.set(dateStr, {
              date: storyUpdateDate.toISOString().split('T')[0],
              storyCount: 1,
              chapters: [syntheticChapter],
              cachedAt: new Date().toISOString(),
            });
          }
        }
      }
    });
  }

  // Get week data with proper day names
  const weekData = weekDays.map(day => {
    const dateStr = day.toDateString();
    const entry = updatesByDate.get(dateStr);
    const isToday = isSameDay(day, new Date());
    const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
    const dateDisplay = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    return {
      date: day,
      dateStr,
      dayName,
      dateDisplay,
      isToday,
      entry,
      hasUpdates: !!entry && entry.chapters.length > 0
    };
  });

  const totalUpdatesThisWeek = weekData.reduce((sum, day) => sum + (day.entry?.chapters.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-6 w-6" />
          <h2 className="text-2xl font-semibold tracking-tight">This Week's Updates</h2>
        </div>
        {totalUpdatesThisWeek > 0 && (
          <Badge variant="secondary" className="text-sm">
            {totalUpdatesThisWeek} updates
          </Badge>
        )}
      </div>

      {totalUpdatesThisWeek === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No updates this week.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {weekData.map(({ date, dateStr, dayName, dateDisplay, isToday, entry, hasUpdates }) => (
            <div key={dateStr}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-semibold">
                  {dayName}
                  {isToday && <span className="text-blue-600 ml-1">(Today)</span>}
                </h3>
                <span className="text-sm text-muted-foreground">{dateDisplay}</span>
                {hasUpdates && (
                  <Badge variant="outline" className="text-sm">
                    {entry!.chapters.length} {entry!.chapters.length === 1 ? 'update' : 'updates'}
                  </Badge>
                )}
              </div>

              {/* Story updates for this date */}
              {hasUpdates && (
                <div className="space-y-4 pl-6">
                  {entry!.chapters.map((chapter, index) => {
                    const storyMetadata = allStoriesData?.storyMap?.get(chapter.workId);
                    
                    return (
                      <div key={`${chapter.workId}-${chapter.chapterNumber}`} className="card-enhanced p-6 ring-2 ring-emerald-200 ring-offset-2">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg leading-tight">{chapter.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">by {chapter.author}</p>
                            
                            {/* Reading Progress Indicator - Enhanced with specific chapter info */}
                            <div className="text-xs font-medium mt-2 px-2 py-1 bg-emerald-50/50 rounded border-l-2 border-l-emerald-400">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                <span className="text-emerald-700 text-xs">
                                  Chapter {chapter.chapterNumber}: {chapter.chapterTitle}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="ml-6 shrink-0 flex flex-col items-end gap-2">
                            <span className="text-xs text-muted-foreground font-medium">
                              Updated {formatDate(entry!.date)}
                            </span>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  window.open(getAO3ChapterUrl(chapter.workId, chapter.chapterNumber), '_blank', 'noopener,noreferrer');
                                }}
                                className="inline-flex items-center gap-1"
                              >
                                Read Chapter ↗
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        {storyMetadata?.summary && (
                          <div className="mb-4">
                            {(() => {
                              const summaryId = `${chapter.workId}-${chapter.chapterNumber}`;
                              const isExpanded = expandedSummaries.has(summaryId);
                              const needsExpansion = getSummaryLines(storyMetadata.summary);
                              
                              return (
                                <>
                                  <div 
                                    className={`text-sm text-foreground leading-relaxed ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}
                                  >
                                    {storyMetadata.summary.replace(/\n+/g, ' ').trim()}
                                  </div>
                                  {needsExpansion && (
                                    <button
                                      onClick={() => toggleSummary(summaryId)}
                                      className="text-xs text-purple-600 hover:text-purple-700 mt-2 font-medium hover:underline"
                                    >
                                      {isExpanded ? 'Show less' : 'Show more'}
                                    </button>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        )}

                        {/* Metadata row - word count, chapters, progress */}
                        <div className="flex items-center gap-6 text-xs text-muted-foreground pt-2 border-t border-muted/30">
                          {storyMetadata?.wordCount && (
                            <span className="font-medium">
                              {storyMetadata.wordCount.toLocaleString()} words
                            </span>
                          )}
                          <span className="font-medium">
                            {storyMetadata?.currentChapters || '?'}/{storyMetadata?.totalChapters || '?'} chapters
                          </span>
                          {storyMetadata?.isComplete !== undefined && (
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              storyMetadata.isComplete 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {storyMetadata.isComplete ? 'Complete' : 'In Progress'}
                            </span>
                          )}
                          {storyMetadata?.readingProgress?.lastOpenedAt && (
                            <span>
                              Last read {formatDate(storyMetadata.readingProgress.lastOpenedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}