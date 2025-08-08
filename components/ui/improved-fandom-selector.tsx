"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { searchFandoms } from "@/lib/comprehensive-fandoms";
import { Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImprovedFandomSelectorProps {
  selectedFandoms: string[];
  onFandomsChange: (fandoms: string[]) => void;
  className?: string;
}

export function ImprovedFandomSelector({ 
  selectedFandoms, 
  onFandomsChange, 
  className 
}: ImprovedFandomSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter fandoms based on search query
  const filteredFandoms = useMemo(() => {
    if (!searchQuery.trim()) {
      return []; // Show nothing until user starts typing
    }
    
    const results = searchFandoms(searchQuery);
    return results.slice(0, 10); // Limit to 10 results for performance
  }, [searchQuery]);

  // Handle fandom selection
  const handleSelectFandom = (fandomName: string) => {
    if (selectedFandoms.includes(fandomName)) {
      // Remove if already selected
      onFandomsChange(selectedFandoms.filter(f => f !== fandomName));
    } else {
      // Add if not selected
      onFandomsChange([...selectedFandoms, fandomName]);
    }
    setSearchQuery(""); // Clear search after selection
    setIsOpen(false);
    setFocusedIndex(-1);
  };

  // Remove selected fandom
  const handleRemoveFandom = (fandomName: string) => {
    onFandomsChange(selectedFandoms.filter(f => f !== fandomName));
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredFandoms.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredFandoms.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredFandoms.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredFandoms.length) {
          handleSelectFandom(filteredFandoms[focusedIndex].name);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setFocusedIndex(-1);
        break;
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsOpen(value.length > 0);
    setFocusedIndex(-1);
  };

  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.length > 0) {
      setIsOpen(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="bg-blue-200 dark:bg-blue-800 font-medium">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type to search fandoms (e.g., Harry Potter, Marvel, The Rookie)..."
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 max-h-[300px] overflow-hidden">
            <CardContent className="p-0">
              {filteredFandoms.length === 0 && searchQuery.length > 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <p>No fandoms found for &quot;{searchQuery}&quot;</p>
                  <p className="text-xs mt-1">
                    Try searching for: Harry Potter, Marvel, Supernatural, BTS, etc.
                  </p>
                </div>
              ) : (
                <div ref={listRef} className="max-h-[300px] overflow-y-auto">
                  {filteredFandoms.map((fandom, index) => {
                    const isSelected = selectedFandoms.includes(fandom.name);
                    const isFocused = index === focusedIndex;
                    
                    return (
                      <div
                        key={fandom.id}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 cursor-pointer border-b last:border-b-0",
                          isFocused && "bg-muted",
                          isSelected && "bg-blue-50 dark:bg-blue-950/20"
                        )}
                        onClick={() => handleSelectFandom(fandom.name)}
                        onMouseEnter={() => setFocusedIndex(index)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {highlightMatch(fandom.name, searchQuery)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {fandom.category}
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Selected Fandoms Display */}
      {selectedFandoms.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Selected Fandoms ({selectedFandoms.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedFandoms.map((fandom) => (
              <Badge key={fandom} variant="secondary" className="pr-1 gap-1">
                <span className="truncate max-w-[200px]">
                  {fandom.split(' - ')[0]}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => handleRemoveFandom(fandom)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {selectedFandoms.length === 0 && searchQuery.length === 0 && (
        <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-md">
          💡 <strong>Start typing to search:</strong> Try &quot;Harry Potter&quot;, &quot;Marvel&quot;, &quot;The Rookie&quot;, &quot;Arcane&quot;, or &quot;K-pop&quot;
        </div>
      )}
    </div>
  );
}