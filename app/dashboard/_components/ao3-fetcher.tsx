"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

// Helper function to format updated dates consistently
function formatUpdatedDate(dateString: string): string {
  if (!dateString) return 'Date unavailable';
  
  // Handle known bad values
  if (dateString === 'Unknown' || dateString === '' || dateString.toLowerCase().includes('unavailable')) {
    return 'Date unavailable';
  }
  
  try {
    // Clean up common AO3 date prefixes
    const cleanedDate = dateString.replace(/^(Updated:|Last updated:|Published:)\s*/i, '').trim();
    
    // Handle ISO date format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanedDate)) {
      const [year, month, day] = cleanedDate.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthName = monthNames[parseInt(month) - 1];
      if (monthName) {
        return `${parseInt(day)} ${monthName} ${year}`;
      }
    }
    
    // If already in DD Mon YYYY format, return as is
    if (/^\d{1,2}\s+\w{3}\s+\d{4}$/.test(cleanedDate)) {
      return cleanedDate;
    }
    
    // Try JavaScript date parsing
    const date = new Date(cleanedDate);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    
    return cleanedDate || 'Date unavailable';
  } catch {
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

interface AO3StoryData {
  workId: string;
  title: string;
  author: string;
  summary: string;
  wordCount: number;
  chapters: {
    current: number;
    total: number | null;
  };
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
}

interface AO3FetcherProps {
  onStorySaved?: () => void;
}

export function AO3Fetcher({ onStorySaved }: AO3FetcherProps = {}) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [storyData, setStoryData] = useState<AO3StoryData | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [expandedRelationships, setExpandedRelationships] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) {
      toast.error("Please enter an AO3 URL or work ID");
      return;
    }

    setLoading(true);
    setStoryData(null);

    try {
      // Check if it's just a work ID (numbers only) or a URL
      const isJustWorkId = /^\d+$/.test(url.trim());
      
      const response = await fetch("/api/ao3/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isJustWorkId ? { workId: url.trim() } : { url }),
      });

      const result = await response.json();

      if (result.success) {
        setStoryData(result.data);
        setIsSaved(false); // Reset save status for new story
        setExpandedSummary(false); // Reset summary expansion for new story
        setExpandedRelationships(false); // Reset relationships expansion for new story
        toast.success("Story information fetched successfully!");
      } else {
        toast.error(result.error || "Failed to fetch story information");
      }
    } catch (error) {
      console.error("Error fetching story:", error);
      toast.error("Network error occurred while fetching story");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!storyData) return;

    setSaving(true);

    try {
      const response = await fetch("/api/stories/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(storyData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSaved(true);
        toast.success("Story saved to your library!");
        onStorySaved?.(); // Trigger refresh of stats and library
      } else {
        if (response.status === 409) {
          toast.info("Story is already in your library");
          setIsSaved(true);
        } else {
          toast.error(result.error || "Failed to save story");
        }
      }
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error("Network error occurred while saving story");
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="space-y-6">
      <Card className="card-enhanced">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl">Add New Story</CardTitle>
          <CardDescription>Enter an AO3 work ID or paste a story URL</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 w-full">
            <Input
              placeholder="Work ID or AO3 URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleFetch();
                }
              }}
              className="flex-1 h-10"
            />
            <Button onClick={handleFetch} disabled={loading} size="default" variant="default" className="shrink-0 px-6">
              {loading ? "Loading..." : "Add Story"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {storyData && (
        <Card className="card-enhanced">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Story Information</CardTitle>
            <CardDescription className="text-base">
              Fetched from AO3 • {isSaved ? "✅ Saved to your library" : "Ready to save to your library"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight mb-1">{storyData.title}</h3>
                  <p className="text-sm text-muted-foreground font-medium">by {storyData.author}</p>
                </div>
              </div>

              {storyData.summary && (
                <div className="bg-muted/30 rounded-lg p-3 border">
                  <div 
                    className={`text-sm leading-relaxed ${!expandedSummary && getSummaryLines(storyData.summary) ? 'line-clamp-2' : ''}`}
                  >
                    {storyData.summary.replace(/\n+/g, ' ').trim()}
                  </div>
                  {getSummaryLines(storyData.summary) && (
                    <button
                      onClick={() => setExpandedSummary(!expandedSummary)}
                      className="text-xs text-purple-600 hover:text-purple-700 mt-2 font-medium hover:underline"
                    >
                      {expandedSummary ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Fandom and Relationship Badges */}
              {(storyData.fandom.length > 0 || storyData.relationships.length > 0) && (
                <div className="flex flex-wrap gap-2">
                  {/* Fandom Badges */}
                  {storyData.fandom.slice(0, 2).map((fandom, index) => (
                    <Badge key={`fandom-${index}`} variant="secondary" className="text-xs px-3 py-1 font-medium bg-muted/50">
                      {fandom}
                    </Badge>
                  ))}
                  {storyData.fandom.length > 2 && (
                    <Badge variant="outline" className="text-xs px-3 py-1 font-medium">
                      +{storyData.fandom.length - 2} more fandoms
                    </Badge>
                  )}
                  
                  {/* Relationship Badges */}
                  {(expandedRelationships ? storyData.relationships : storyData.relationships.slice(0, 2)).map((relationship, index) => (
                    <Badge key={`rel-${index}`} variant="outline" className="text-xs px-3 py-1 font-medium bg-background">
                      {cleanRelationshipName(relationship)}
                    </Badge>
                  ))}
                  {storyData.relationships.length > 2 && (
                    <button
                      onClick={() => setExpandedRelationships(!expandedRelationships)}
                      className="text-xs font-medium px-3 py-1 rounded-md border border-purple-200 text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      {expandedRelationships 
                        ? 'Show less' 
                        : `+${storyData.relationships.length - 2} more relationships`
                      }
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                <span className="font-medium">{storyData.wordCount.toLocaleString()} words</span>
                <span className="font-medium">{storyData.chapters.current.toLocaleString()}/{storyData.chapters.total?.toLocaleString() || "?"} chapters</span>
                <span className="font-medium">{storyData.isComplete ? "✅ Complete" : "⏳ In Progress"}</span>
                <span className="font-medium">👍 {storyData.kudos.toLocaleString()}</span>
                <span className="font-medium">Updated {formatUpdatedDate(storyData.lastUpdatedDate)}</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || isSaved}
                  variant={isSaved ? "secondary" : "default"}
                  className={isSaved ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                  size="default"
                >
                  {saving ? "Saving..." : isSaved ? "✓ Saved" : "Save to Library"}
                </Button>
                <Button variant="outline" size="default" className="shadow-sm" asChild>
                  <a href={storyData.url} target="_blank" rel="noopener noreferrer">
                    Read on AO3 ↗
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}