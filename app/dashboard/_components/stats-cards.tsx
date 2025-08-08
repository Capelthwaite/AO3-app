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
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="card-enhanced">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              📚
            </div>
            Stories Saved
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight">
            {loading ? "..." : stats.totalStories.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalStories === 0 ? "No stories yet" : "Total in your library"}
          </p>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
              📖
            </div>
            Currently Reading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-purple-600">
            {loading ? "..." : stats.currentlyReading.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Stories in progress</p>
        </CardContent>
      </Card>

      <Card className="card-enhanced">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
              ✨
            </div>
            Updates Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-tight text-emerald-600">
            {loading ? "..." : stats.updatesAvailable.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.updatesAvailable === 1 ? "New chapter to read" : "New chapters to read"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}