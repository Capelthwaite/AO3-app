"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Star,
  StarOff,
  MoreVertical,
  Edit,
  Trash2,
  Play,
  Plus,
} from "lucide-react";

interface SearchFilters {
  query: string;
  fandoms: string[];
  complete: string;
  words_from: string;
  words_to: string;
  kudos_from: string;
  sort_column: string;
}

interface SavedFilterSet {
  id: string;
  name: string;
  description?: string;
  filters: SearchFilters;
  isPinned: boolean;
  useCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SavedFilterSetsProps {
  currentFilters: SearchFilters;
  onLoadFilters: (filters: SearchFilters) => void;
}

export function SavedFilterSets({ currentFilters, onLoadFilters }: SavedFilterSetsProps) {
  const [savedFilterSets, setSavedFilterSets] = useState<SavedFilterSet[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingSet, setEditingSet] = useState<SavedFilterSet | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newFilterSetName, setNewFilterSetName] = useState("");
  const [newFilterSetDescription, setNewFilterSetDescription] = useState("");
  const [newFilterSetPinned, setNewFilterSetPinned] = useState(false);

  const { data: session } = authClient.useSession();

  // Load saved filter sets
  const loadFilterSets = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch("/api/filter-sets");
      const result = await response.json();

      if (result.success) {
        setSavedFilterSets(result.data);
      } else {
        toast.error(result.error || "Failed to load filter sets");
      }
    } catch (error) {
      console.error("Error loading filter sets:", error);
      toast.error("Failed to load filter sets");
    }
  }, [session?.user]);

  // Save current filters as a new filter set
  const saveFilterSet = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save filter sets");
      return;
    }

    if (!newFilterSetName.trim()) {
      toast.error("Please enter a name for the filter set");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/filter-sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFilterSetName.trim(),
          description: newFilterSetDescription.trim() || undefined,
          filters: currentFilters,
          isPinned: newFilterSetPinned,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSavedFilterSets([result.data, ...savedFilterSets]);
        toast.success("Filter set saved successfully!");
        setSaveDialogOpen(false);
        setNewFilterSetName("");
        setNewFilterSetDescription("");
        setNewFilterSetPinned(false);
      } else {
        toast.error(result.error || "Failed to save filter set");
      }
    } catch (error) {
      console.error("Error saving filter set:", error);
      toast.error("Failed to save filter set");
    } finally {
      setSaving(false);
    }
  };

  // Load a filter set
  const loadFilterSet = async (filterSet: SavedFilterSet) => {
    // Track usage
    try {
      await fetch(`/api/filter-sets/${filterSet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incrementUsage: true }),
      });

      // Update local state
      setSavedFilterSets(sets =>
        sets.map(set =>
          set.id === filterSet.id
            ? { ...set, useCount: set.useCount + 1, lastUsed: new Date() }
            : set
        )
      );
    } catch (error) {
      console.error("Error tracking usage:", error);
    }

    onLoadFilters(filterSet.filters);
    toast.success(`Loaded "${filterSet.name}" filter set`);
  };

  // Toggle pin status
  const togglePinStatus = async (filterSet: SavedFilterSet) => {
    try {
      const response = await fetch(`/api/filter-sets/${filterSet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !filterSet.isPinned }),
      });

      if (response.ok) {
        setSavedFilterSets(sets =>
          sets.map(set =>
            set.id === filterSet.id ? { ...set, isPinned: !set.isPinned } : set
          )
        );
        toast.success(
          filterSet.isPinned ? "Filter set unpinned" : "Filter set pinned"
        );
      }
    } catch (error) {
      console.error("Error toggling pin status:", error);
      toast.error("Failed to update pin status");
    }
  };

  // Delete filter set
  const deleteFilterSet = async (filterSet: SavedFilterSet) => {
    try {
      const response = await fetch(`/api/filter-sets/${filterSet.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSavedFilterSets(sets => sets.filter(set => set.id !== filterSet.id));
        toast.success("Filter set deleted");
      } else {
        toast.error("Failed to delete filter set");
      }
    } catch (error) {
      console.error("Error deleting filter set:", error);
      toast.error("Failed to delete filter set");
    }
  };

  // Update filter set
  const updateFilterSet = async () => {
    if (!editingSet || !editingSet.name.trim()) return;

    try {
      const response = await fetch(`/api/filter-sets/${editingSet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingSet.name,
          description: editingSet.description,
          isPinned: editingSet.isPinned,
        }),
      });

      if (response.ok) {
        setSavedFilterSets(sets =>
          sets.map(set =>
            set.id === editingSet.id ? { ...set, ...editingSet } : set
          )
        );
        toast.success("Filter set updated");
        setEditDialogOpen(false);
        setEditingSet(null);
      } else {
        toast.error("Failed to update filter set");
      }
    } catch (error) {
      console.error("Error updating filter set:", error);
      toast.error("Failed to update filter set");
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadFilterSets();
    }
  }, [session?.user, loadFilterSets]);

  // Generate a smart name for current filters
  const generateFilterSetName = () => {
    const parts: string[] = [];
    
    if (currentFilters.fandoms.length > 0) {
      if (currentFilters.fandoms.length === 1) {
        parts.push(currentFilters.fandoms[0]);
      } else {
        parts.push(`${currentFilters.fandoms.length} Fandoms`);
      }
    }
    
    if (currentFilters.complete === 'true') parts.push("Complete");
    if (currentFilters.complete === 'false') parts.push("WIP");
    if (currentFilters.kudos_from) parts.push(`${currentFilters.kudos_from}+ Kudos`);
    
    return parts.join(" • ") || "My Filter Set";
  };

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Sign in to save and manage filter sets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Save Current Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Save</CardTitle>
        </CardHeader>
        <CardContent>
          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setNewFilterSetName(generateFilterSetName())}
              >
                <Plus className="w-4 h-4 mr-1" />
                Save Current Filters
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Filter Set</DialogTitle>
                <DialogDescription>
                  Save your current search filters for quick access later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newFilterSetName}
                    onChange={(e) => setNewFilterSetName(e.target.value)}
                    placeholder="My favorite filters..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={newFilterSetDescription}
                    onChange={(e) => setNewFilterSetDescription(e.target.value)}
                    placeholder="Describe this filter set..."
                    rows={2}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pinned"
                    checked={newFilterSetPinned}
                    onChange={(e) => setNewFilterSetPinned(e.target.checked)}
                  />
                  <Label htmlFor="pinned">Pin for quick access</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSaveDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button onClick={saveFilterSet} disabled={saving}>
                  {saving ? "Saving..." : "Save Filter Set"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Saved Filter Sets */}
      {savedFilterSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Saved Filter Sets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedFilterSets.map((filterSet) => (
                <div
                  key={filterSet.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">
                        {filterSet.name}
                      </h4>
                      {filterSet.isPinned && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                    </div>
                    {filterSet.description && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {filterSet.description}
                      </p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {filterSet.filters.fandoms.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {filterSet.filters.fandoms.length === 1
                            ? filterSet.filters.fandoms[0]
                            : `${filterSet.filters.fandoms.length} fandoms`}
                        </Badge>
                      )}
                      {filterSet.filters.kudos_from && (
                        <Badge variant="outline" className="text-xs">
                          {filterSet.filters.kudos_from}+ kudos
                        </Badge>
                      )}
                      {filterSet.filters.complete === "true" && (
                        <Badge variant="outline" className="text-xs">
                          Complete
                        </Badge>
                      )}
                      {filterSet.filters.complete === "false" && (
                        <Badge variant="outline" className="text-xs">
                          WIP
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used {filterSet.useCount} times
                      {filterSet.lastUsed &&
                        ` • Last used ${new Date(
                          filterSet.lastUsed
                        ).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => loadFilterSet(filterSet)}
                      title="Load this filter set"
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingSet(filterSet);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => togglePinStatus(filterSet)}>
                          {filterSet.isPinned ? (
                            <StarOff className="w-3 h-3 mr-2" />
                          ) : (
                            <Star className="w-3 h-3 mr-2" />
                          )}
                          {filterSet.isPinned ? "Unpin" : "Pin"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => deleteFilterSet(filterSet)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Filter Set</DialogTitle>
          </DialogHeader>
          {editingSet && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingSet.name}
                  onChange={(e) =>
                    setEditingSet({ ...editingSet, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description (optional)</Label>
                <Textarea
                  id="edit-description"
                  value={editingSet.description || ""}
                  onChange={(e) =>
                    setEditingSet({
                      ...editingSet,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-pinned"
                  checked={editingSet.isPinned}
                  onChange={(e) =>
                    setEditingSet({
                      ...editingSet,
                      isPinned: e.target.checked,
                    })
                  }
                />
                <Label htmlFor="edit-pinned">Pin for quick access</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setEditingSet(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={updateFilterSet}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}