"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface UserStats {
  totalStories: number;
  currentlyReading: number;
  updatesAvailable: number;
}

export function StatsCards() {
  const [stats, setStats] = useState<UserStats>({
    totalStories: 0,
    currentlyReading: 0,
    updatesAvailable: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stories/stats");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStats(result.stats);
          }
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Stories Saved</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.totalStories.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.totalStories === 0 ? "No stories yet" : "Stories in your library"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Currently Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.currentlyReading.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Stories in progress</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Updates Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : stats.updatesAvailable.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.updatesAvailable === 1 ? "New chapter to read" : "New chapters to read"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}