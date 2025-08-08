"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Filter, 
  BookOpen, 
  Sparkles, 
  Plus,
  Star,
  Heart,
  Trash2,
  MoreVertical,
  Edit
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useState } from "react";
import { ApiSearchFilters, SavedFilter, getFandomsArray } from "@/types";

interface EmptyStateProps {
  hasFilters: boolean;
  savedFilters: SavedFilter[];
  onCreateFilter: () => void;
  onSelectFilter: (filterId: string) => void;
  onDeleteFilter?: (filterId: string) => void;
  onEditFilter?: (filterId: string, newName: string) => void;
  loading: boolean;
}

export function EmptyState({ 
  hasFilters, 
  savedFilters, 
  onCreateFilter, 
  onSelectFilter, 
  onDeleteFilter,
  onEditFilter,
  loading 
}: EmptyStateProps) {
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  
  const handleDeleteFilter = async (filterId: string, filterName: string) => {
    if (!onDeleteFilter) return;
    
    try {
      const response = await fetch(`/api/filter-sets/${filterId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDeleteFilter(filterId);
        toast.success(`Deleted "${filterName}" filter`);
      } else {
        toast.error("Failed to delete filter");
      }
    } catch (error) {
      console.error("Error deleting filter:", error);
      toast.error("Failed to delete filter");
    }
  };

  const handleEditFilter = (filter: SavedFilter) => {
    setEditingFilter(filter);
    setEditName(filter.name);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFilter || !onEditFilter || !editName.trim()) return;

    try {
      const response = await fetch(`/api/filter-sets/${editingFilter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
        }),
      });

      if (response.ok) {
        onEditFilter(editingFilter.id, editName.trim());
        toast.success(`Renamed filter to "${editName.trim()}"`);
        setEditDialogOpen(false);
        setEditingFilter(null);
        setEditName('');
      } else {
        toast.error("Failed to update filter");
      }
    } catch (error) {
      console.error("Error updating filter:", error);
      toast.error("Failed to update filter");
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your filters...</p>
        </div>
      </div>
    );
  }

  // First-time user - no saved filters
  if (!hasFilters) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mb-6">
              <BookOpen className="w-16 h-16 mx-auto text-blue-500 mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Welcome to Story Discovery!</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Create your first story filter to start exploring fanfiction. 
                Choose your favorite fandoms and preferences to discover amazing stories!
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Filter className="w-4 h-4" />
                  <span>Smart Filtering</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  <span>Multi-Fandom Support</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>Save Favorites</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg max-w-md mx-auto">
                <h3 className="font-medium text-sm mb-2">🚀 Why Use Filters?</h3>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Find stories faster with targeted search</li>
                  <li>• Select multiple fandoms (unlike AO3!)</li>
                  <li>• Save time with reusable filter sets</li>
                  <li>• Discover new stories you&apos;ll love</li>
                </ul>
              </div>
            </div>

            <Button size="lg" onClick={onCreateFilter} className="px-8">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Filter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Returning user - show saved filters + create new option
  const pinnedFilters = savedFilters.filter(f => f.isPinned);
  const recentFilters = savedFilters
    .filter(f => !f.isPinned)
    .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
    .slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto py-6">
      <div className="text-center mb-6">
        <Filter className="w-10 h-10 mx-auto text-blue-500 mb-3" />
        <h2 className="text-xl font-semibold mb-1">Choose a Story Filter</h2>
        <p className="text-sm text-muted-foreground">
          Select a saved filter or create a new one to discover stories
        </p>
      </div>

      <div className="space-y-6">
        {/* Create New Filter */}
        <Card className="border-dashed border-2 hover:border-blue-300 transition-colors">
          <CardContent className="py-4">
            <div className="text-center">
              <Plus className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium mb-1">Create New Filter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Build a custom filter for discovering new stories
              </p>
              <Button onClick={onCreateFilter} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pinned Filters */}
        {pinnedFilters.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              Pinned Filters
            </h3>
            <div className="space-y-2 mb-6">
              {pinnedFilters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectFilter(filter.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                      <h4 className="font-medium hover:text-blue-600 truncate">
                        {filter.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1">
                        {getFandomsArray(filter.filters).slice(0, 3).map((fandom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {fandom.split(' - ')[0]}
                          </Badge>
                        ))}
                        {getFandomsArray(filter.filters).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{getFandomsArray(filter.filters).length - 3}
                          </Badge>
                        )}
                      </div>
                      {filter.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {filter.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {onDeleteFilter && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteFilter(filter.id, filter.name)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Saved Filters */}
        {recentFilters.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-4">Saved Filters</h3>
            <div className="space-y-2 mb-6">
              {recentFilters.map((filter) => (
                <div key={filter.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectFilter(filter.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium hover:text-blue-600 truncate">
                        {filter.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1">
                        {getFandomsArray(filter.filters).slice(0, 3).map((fandom, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {fandom.split(' - ')[0]}
                          </Badge>
                        ))}
                        {getFandomsArray(filter.filters).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{getFandomsArray(filter.filters).length - 3}
                          </Badge>
                        )}
                      </div>
                      {filter.description && (
                        <span className="text-xs text-muted-foreground truncate max-w-xs">
                          {filter.description}
                        </span>
                      )}
                    </div>
                  </div>
                  {(onDeleteFilter || onEditFilter) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onEditFilter && (
                          <DropdownMenuItem
                            onClick={() => handleEditFilter(filter)}
                          >
                            <Edit className="w-3 h-3 mr-2" />
                            Edit Name
                          </DropdownMenuItem>
                        )}
                        {onDeleteFilter && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteFilter(filter.id, filter.name)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-3 h-3 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show all filters link if there are more than displayed */}
        {savedFilters.length > (pinnedFilters.length + recentFilters.length) && (
          <div className="text-center">
            <Button variant="outline">
              View All {savedFilters.length} Filters ({savedFilters.length - (pinnedFilters.length + recentFilters.length)} more)
            </Button>
          </div>
        )}
      </div>

      {/* Edit Filter Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filter Name</DialogTitle>
            <DialogDescription>
              Change the name of your saved filter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Filter name..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingFilter(null);
                setEditName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}