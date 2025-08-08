"use client";

import { SinglePageStoryBrowser } from "@/components/ui/single-page-story-browser";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SavedFilter } from "@/types";

export function BrowseStories() {
  // Check if there's persisted state to determine initial browser visibility
  const checkPersistedState = () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const persistedState = sessionStorage.getItem('browseStoriesState');
      return persistedState ? JSON.parse(persistedState) : null;
    } catch (error) {
      return null;
    }
  };

  const [showBrowser, setShowBrowser] = useState(() => {
    const persistedState = checkPersistedState();
    return !!(persistedState && (persistedState.filters?.fandoms?.length > 0 || persistedState.results));
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<SavedFilter | null>(null);

  // Load saved filters on mount
  useEffect(() => {
    loadSavedFilters();
  }, []);

  const loadSavedFilters = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/filter-sets');
      const result = await response.json();

      if (result.success) {
        const filters = result.data.map((filter: Record<string, unknown>) => ({
          ...filter,
          lastUsed: filter.lastUsed ? new Date(filter.lastUsed as string) : null,
          createdAt: new Date(filter.createdAt as string),
          updatedAt: new Date(filter.updatedAt as string),
        }));
        setSavedFilters(filters);
      } else {
        toast.error(result.error || 'Failed to load filters');
      }
    } catch (error) {
      console.error('Error loading filters:', error);
      toast.error('Failed to load filters');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFilter = async (filterId: string) => {
    const filter = savedFilters.find(f => f.id === filterId);
    if (!filter) return;

    // Track usage
    try {
      await fetch(`/api/filter-sets/${filterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incrementUsage: true }),
      });

      // Update local state
      setSavedFilters(prev => 
        prev.map(f => 
          f.id === filterId 
            ? { ...f, useCount: f.useCount + 1, lastUsed: new Date() }
            : f
        )
      );
    } catch (error) {
      console.error('Error tracking usage:', error);
    }

    // Clear any persisted state when loading a saved filter
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('browseStoriesState');
    }

    // Set the selected filter and go to browser with this filter loaded
    setSelectedFilter(filter);
    setShowBrowser(true);
    toast.success(`Loaded "${filter.name}" filter`);
  };

  const handleDeleteFilter = (filterId: string) => {
    setSavedFilters(prev => prev.filter(f => f.id !== filterId));
  };

  const handleEditFilter = (filterId: string, newName: string) => {
    setSavedFilters(prev => 
      prev.map(f => f.id === filterId ? { ...f, name: newName } : f)
    );
  };

  const handleFilterSaved = () => {
    // Don't interfere with active browsing session
    // The filter list will be reloaded when user returns to filter selection
    console.log('Filter saved - no action needed during browsing session');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your story filters...</p>
        </div>
      </div>
    );
  }

  // Show the browser directly if they've started browsing or have no filters
  if (showBrowser || savedFilters.length === 0) {
    return (
      <div className="space-y-4">
        {/* Option to go back to saved filters if they exist */}
        {savedFilters.length > 0 && (
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={() => {
              // Clear persisted state when explicitly going back to filter selection
              if (typeof window !== 'undefined') {
                sessionStorage.removeItem('browseStoriesState');
              }
              setShowBrowser(false);
              setSelectedFilter(null); // Clear selected filter
              loadSavedFilters(); // Refresh filter list when returning to filter selection
            }}>
              ← Back to Saved Filters
            </Button>
          </div>
        )}
        <SinglePageStoryBrowser 
          onFilterSaved={handleFilterSaved}
          initialFilter={selectedFilter ? {
            name: selectedFilter.name,
            filters: selectedFilter.filters as any // Convert from Record<string, unknown> to SearchFilters
          } : undefined}
        />
      </div>
    );
  }

  // Show saved filters as entry point
  return (
    <div className="space-y-4">
      <EmptyState
        hasFilters={savedFilters.length > 0}
        savedFilters={savedFilters}
        onCreateFilter={() => {
          // Clear any persisted state when creating a new filter
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('browseStoriesState');
          }
          setSelectedFilter(null); // Clear selected filter when creating new
          setShowBrowser(true);
        }}
        onSelectFilter={handleSelectFilter}
        onDeleteFilter={handleDeleteFilter}
        onEditFilter={handleEditFilter}
        loading={false}
      />
    </div>
  );
}