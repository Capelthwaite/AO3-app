"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Search } from "lucide-react";
import { searchPairingsInFandoms } from "@/lib/fandom-characters";

interface PairingSelectorProps {
  selectedPairings: string[];
  onPairingsChange: (pairings: string[]) => void;
  selectedFandoms: string[];
}

export function PairingSelector({ 
  selectedPairings, 
  onPairingsChange, 
  selectedFandoms 
}: PairingSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Search for pairings when query changes
  useEffect(() => {
    if (searchQuery.trim() && selectedFandoms.length > 0) {
      setIsSearching(true);
      const results = searchPairingsInFandoms(searchQuery, selectedFandoms);
      setSearchResults(results);
      setSelectedIndex(-1); // Reset selection when results change
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [searchQuery, selectedFandoms]);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }, [selectedIndex]);

  // Close dropdown when other dropdowns open
  useEffect(() => {
    const handleCloseOthers = (event: CustomEvent) => {
      if (event.detail !== 'pairing') {
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    };

    window.addEventListener('closeOtherDropdowns', handleCloseOthers);
    
    return () => {
      window.removeEventListener('closeOtherDropdowns', handleCloseOthers);
    };
  }, []);

  const handleAddPairing = (pairing: string) => {
    if (!selectedPairings.includes(pairing)) {
      onPairingsChange([...selectedPairings, pairing]);
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  const handleRemovePairing = (pairingToRemove: string) => {
    onPairingsChange(selectedPairings.filter(p => p !== pairingToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          if (prev === -1) return 0; // Start from first item
          return prev < searchResults.length - 1 ? prev + 1 : 0;
        });
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          if (prev === -1) return searchResults.length - 1; // Start from last item
          return prev > 0 ? prev - 1 : searchResults.length - 1;
        });
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleAddPairing(searchResults[selectedIndex]);
        } else if (searchResults.length > 0) {
          // If no item is highlighted, select the first one
          handleAddPairing(searchResults[0]);
        }
        break;
      
      case 'Escape':
        e.preventDefault();
        setSearchQuery("");
        setSearchResults([]);
        setSelectedIndex(-1);
        break;
    }
  };

  // Highlight matching text in search results
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.slice(0, index)}
        <span className="search-highlight">
          {text.slice(index, index + query.length)}
        </span>
        {text.slice(index + query.length)}
      </>
    );
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={selectedFandoms.length > 0 ? "Search for relationships (e.g., Clarke, Bellamy/Clarke)" : "Select fandoms first to search relationships"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            window.dispatchEvent(new CustomEvent('closeOtherDropdowns', { detail: 'pairing' }));
          }}
          className="pl-10"
          disabled={selectedFandoms.length === 0}
        />
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div ref={resultsRef} className="max-h-40 overflow-y-auto border rounded-md bg-white border-[hsl(214.3_31.8%_91.4%)] shadow-lg">
          {searchResults.map((pairing, index) => (
            <button
              key={pairing}
              onClick={() => handleAddPairing(pairing)}
              disabled={selectedPairings.includes(pairing)}
              className={`w-full text-left px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm border-b last:border-b-0 transition-colors ${
                index === selectedIndex 
                  ? 'bg-[hsl(262.1_83.3%_57.8%)] text-[hsl(210_20%_98%)]' 
                  : 'hover:bg-muted'
              }`}
            >
              {highlightMatch(pairing, searchQuery)}
              {selectedPairings.includes(pairing) && (
                <span className={`ml-2 ${index === selectedIndex ? 'text-[hsl(210_20%_98%)] opacity-70' : 'text-muted-foreground'}`}>
                  (already selected)
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Selected Pairings */}
      {selectedPairings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedPairings.map((pairing) => (
            <Badge key={pairing} variant="secondary" className="text-xs">
              {pairing}
              <button
                onClick={() => handleRemovePairing(pairing)}
                className="ml-2 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* No fandoms selected message */}
      {selectedFandoms.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Select fandoms above to search for popular relationships
        </p>
      )}

      {/* No results message */}
      {searchQuery.trim() && selectedFandoms.length > 0 && searchResults.length === 0 && !isSearching && (
        <p className="text-xs text-muted-foreground">
          No relationships found matching &quot;{searchQuery}&quot;
        </p>
      )}
    </div>
  );
}