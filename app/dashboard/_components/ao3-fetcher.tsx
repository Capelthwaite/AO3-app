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
      <div className="border rounded-lg p-6 bg-card border-border">
        <h2 className="text-lg font-semibold text-card-foreground mb-2">Add New Story</h2>
        <p className="text-sm text-muted-foreground mb-4">Enter an AO3 work ID or paste a story URL</p>
        
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
            className="flex-1"
          />
          <Button onClick={handleFetch} disabled={loading} size="sm" className="shrink-0">
            {loading ? "Loading..." : "Add Story"}
          </Button>
        </div>
      </div>

      {storyData && (
        <Card>
          <CardHeader>
            <CardTitle>Story Information</CardTitle>
            <CardDescription>
              Fetched from AO3 • {isSaved ? "Saved to your library" : "Ready to save to your library"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg">{storyData.title}</h3>
                  <p className="text-sm text-muted-foreground">by {storyData.author}</p>
                </div>
              </div>

              {storyData.summary && (
                <div>
                  <div 
                    className={`text-sm text-muted-foreground leading-relaxed ${!expandedSummary && getSummaryLines(storyData.summary) ? 'line-clamp-2' : ''}`}
                  >
                    {storyData.summary.replace(/\n+/g, ' ').trim()}
                  </div>
                  {getSummaryLines(storyData.summary) && (
                    <button
                      onClick={() => setExpandedSummary(!expandedSummary)}
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                    >
                      {expandedSummary ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}

              {/* Fandom and Relationship Badges */}
              {(storyData.fandom.length > 0 || storyData.relationships.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Fandom Badges */}
                  {storyData.fandom.slice(0, 2).map((fandom, index) => (
                    <Badge key={`fandom-${index}`} variant="secondary" className="text-xs">
                      {fandom}
                    </Badge>
                  ))}
                  {storyData.fandom.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{storyData.fandom.length - 2} more fandoms
                    </Badge>
                  )}
                  
                  {/* Relationship Badges */}
                  {storyData.relationships.slice(0, 2).map((relationship, index) => (
                    <Badge key={`rel-${index}`} variant="outline" className="text-xs">
                      {cleanRelationshipName(relationship)}
                    </Badge>
                  ))}
                  {storyData.relationships.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{storyData.relationships.length - 2} more relationships
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{storyData.wordCount.toLocaleString()} words</span>
                <span>{storyData.chapters.current.toLocaleString()}/{storyData.chapters.total?.toLocaleString() || "?"}</span>
                <span>{storyData.isComplete ? "Complete" : "In Progress"}</span>
                <span>👍 {storyData.kudos.toLocaleString()}</span>
                <span>Updated {formatUpdatedDate(storyData.lastUpdatedDate)}</span>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleSave} 
                  disabled={saving || isSaved}
                  className={isSaved ? "bg-green-600 hover:bg-green-700" : ""}
                  size="sm"
                >
                  {saving ? "Saving..." : isSaved ? "✓ Saved" : "Save to Library"}
                </Button>
                <Button variant="outline" size="sm" asChild>
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