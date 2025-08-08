"use client";

import { useState } from "react";
import { AO3Fetcher } from "./ao3-fetcher";
import { StatsCards } from "./stats-cards";
import { StoryLibrary } from "./story-library";

export function DashboardContent() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleStorySaved = () => {
    // Trigger a refresh by updating the key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="grid gap-6">
      {/* AO3 Story Fetcher */}
      <AO3Fetcher onStorySaved={handleStorySaved} />

      {/* Quick Stats */}
      <StatsCards key={`stats-${refreshKey}`} />

      {/* Story Library */}
      <StoryLibrary key={`library-${refreshKey}`} />
    </div>
  );
}