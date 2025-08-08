"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ImprovedFandomSelector } from "@/components/ui/improved-fandom-selector";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  BookOpen, 
  Settings, 
  Save,
  Sparkles
} from "lucide-react";

interface SearchFilters {
  query: string;
  fandoms: string[];
  complete: string;
  words_from: string;
  words_to: string;
  kudos_from: string;
  sort_column: string;
  page: number;
}

interface FilterCreationWizardProps {
  onFilterCreated: (filters: SearchFilters, filterName: string) => void;
  onCancel: () => void;
  initialStep?: number;
}

type WizardStep = 1 | 2 | 3;

export function FilterCreationWizard({ 
  onFilterCreated, 
  onCancel, 
  initialStep = 1 
}: FilterCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep as WizardStep);
  const [selectedFandoms, setSelectedFandoms] = useState<string[]>([]);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [storyPreferences, setStoryPreferences] = useState({
    complete: '',
    words_from: '',
    words_to: '',
    kudos_from: '',
    sort_column: 'revised_at',
  });

  // No need to prepare options - ImprovedFandomSelector handles this internally


  const handleNext = () => {
    if (currentStep === 1) {
      if (selectedFandoms.length === 0) {
        toast.error("Please select at least one fandom to continue");
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as WizardStep);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleCreateFilter = () => {
    if (!filterName.trim()) {
      toast.error("Please enter a name for your filter");
      return;
    }

    const filters: SearchFilters = {
      query: '',
      fandoms: selectedFandoms,
      complete: storyPreferences.complete,
      words_from: storyPreferences.words_from,
      words_to: storyPreferences.words_to,
      kudos_from: storyPreferences.kudos_from,
      sort_column: storyPreferences.sort_column,
      page: 1,
    };

    onFilterCreated(filters, filterName);
  };

  const generateFilterName = () => {
    const parts: string[] = [];
    
    if (selectedFandoms.length === 1) {
      parts.push(selectedFandoms[0].split(' - ')[0]);
    } else if (selectedFandoms.length > 1) {
      parts.push(`${selectedFandoms.length} Fandoms`);
    }
    
    if (storyPreferences.complete === 'true') parts.push("Complete");
    if (storyPreferences.complete === 'false') parts.push("WIP");
    if (storyPreferences.kudos_from) parts.push(`${storyPreferences.kudos_from}+ Kudos`);
    
    return parts.join(" • ") || "My Filter";
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-blue-500" />
        <h2 className="text-2xl font-semibold mb-2">Choose Your Fandoms</h2>
        <p className="text-muted-foreground">
          Select one or more fandoms you&apos;d like to explore. You can choose multiple fandoms - 
          a key advantage over AO3&apos;s single-fandom limitation!
        </p>
      </div>

      <div className="space-y-4">
        <Label>Search and Select Fandoms</Label>
        <ImprovedFandomSelector
          selectedFandoms={selectedFandoms}
          onFandomsChange={setSelectedFandoms}
        />
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2">💡 Pro Tip</h3>
        <p className="text-sm text-muted-foreground">
          Unlike AO3, you can select multiple fandoms to discover crossovers and similar stories. 
          Popular combinations include Marvel + DC, Harry Potter + Percy Jackson, or any fandoms you enjoy!
        </p>
      </div>

      {selectedFandoms.length > 0 && (
        <div className="text-center">
          <p className="text-sm text-green-600 dark:text-green-400">
            ✓ {selectedFandoms.length} fandom{selectedFandoms.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="w-12 h-12 mx-auto mb-4 text-green-500" />
        <h2 className="text-2xl font-semibold mb-2">Story Preferences</h2>
        <p className="text-muted-foreground">
          Fine-tune your search with story preferences to find exactly what you&apos;re looking for.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Completion Status</Label>
          <Select 
            value={storyPreferences.complete || "any"} 
            onValueChange={(value) => setStoryPreferences(prev => ({ 
              ...prev, 
              complete: value === "any" ? "" : value 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="true">Complete Only</SelectItem>
              <SelectItem value="false">In Progress Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Minimum Kudos</Label>
          <Input
            type="number"
            placeholder="e.g. 500"
            value={storyPreferences.kudos_from}
            onChange={(e) => setStoryPreferences(prev => ({ 
              ...prev, 
              kudos_from: e.target.value 
            }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Sort Stories By</Label>
          <Select 
            value={storyPreferences.sort_column} 
            onValueChange={(value) => setStoryPreferences(prev => ({ 
              ...prev, 
              sort_column: value 
            }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revised_at">Recently Updated</SelectItem>
              <SelectItem value="kudos_count">Most Kudos</SelectItem>
              <SelectItem value="hits">Most Hits</SelectItem>
              <SelectItem value="bookmarks_count">Most Bookmarks</SelectItem>
              <SelectItem value="comments_count">Most Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Word Count Range</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Min"
              value={storyPreferences.words_from}
              onChange={(e) => setStoryPreferences(prev => ({ 
                ...prev, 
                words_from: e.target.value 
              }))}
            />
            <Input
              placeholder="Max"
              value={storyPreferences.words_to}
              onChange={(e) => setStoryPreferences(prev => ({ 
                ...prev, 
                words_to: e.target.value 
              }))}
            />
          </div>
        </div>
      </div>

      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2">📚 Your Selection Preview</h3>
        <div className="flex flex-wrap gap-2">
          {selectedFandoms.slice(0, 3).map((fandom, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {fandom.split(' - ')[0]}
            </Badge>
          ))}
          {selectedFandoms.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{selectedFandoms.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-500" />
        <h2 className="text-2xl font-semibold mb-2">Save Your Filter</h2>
        <p className="text-muted-foreground">
          Give your filter a name and start discovering amazing stories!
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="filter-name">Filter Name</Label>
          <Input
            id="filter-name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder={generateFilterName()}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will help you identify your filter later
          </p>
        </div>

        <div>
          <Label htmlFor="filter-description">Description (Optional)</Label>
          <Textarea
            id="filter-description"
            value={filterDescription}
            onChange={(e) => setFilterDescription(e.target.value)}
            placeholder="e.g., My favorite completed longfics with happy endings..."
            rows={2}
            className="mt-1"
          />
        </div>
      </div>

      <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-3">🎯 Filter Summary</h3>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Fandoms:</strong> {selectedFandoms.length} selected
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedFandoms.slice(0, 2).map((fandom, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {fandom.split(' - ')[0]}
                </Badge>
              ))}
              {selectedFandoms.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{selectedFandoms.length - 2} more
                </Badge>
              )}
            </div>
          </div>
          
          <div>
            <strong>Completion:</strong> {
              storyPreferences.complete === 'true' ? 'Complete only' :
              storyPreferences.complete === 'false' ? 'In progress only' : 'Any'
            }
          </div>
          
          {storyPreferences.kudos_from && (
            <div><strong>Minimum Kudos:</strong> {storyPreferences.kudos_from}</div>
          )}
          
          <div>
            <strong>Sort by:</strong> {
              storyPreferences.sort_column === 'revised_at' ? 'Recently Updated' :
              storyPreferences.sort_column === 'kudos_count' ? 'Most Kudos' :
              storyPreferences.sort_column === 'hits' ? 'Most Hits' :
              storyPreferences.sort_column === 'bookmarks_count' ? 'Most Bookmarks' :
              'Most Comments'
            }
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <CardTitle>Create Story Filter</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>1</span>
            <ChevronRight className="w-3 h-3" />
            <span className={currentStep >= 2 ? "text-green-600 font-medium" : ""}>2</span>
            <ChevronRight className="w-3 h-3" />
            <span className={currentStep >= 3 ? "text-purple-600 font-medium" : ""}>3</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6 mt-6 border-t">
          <div>
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
          
          <div>
            {currentStep < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleCreateFilter}>
                <Save className="w-4 h-4 mr-1" />
                Create Filter & Show Stories
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}