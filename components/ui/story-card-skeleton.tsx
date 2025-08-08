"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function StoryCardSkeleton() {
  return (
    <div className="card-enhanced p-6">
      {/* Header with title and author */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="h-6 w-3/4" /> {/* Title */}
          </div>
          <Skeleton className="h-4 w-32" /> {/* Author */}
        </div>
        <div className="ml-6 shrink-0 flex flex-col items-end gap-2">
          <Skeleton className="h-3 w-24" /> {/* Updated date */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" /> {/* Delete button */}
            <Skeleton className="h-8 w-24" /> {/* Read button */}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-18" />
      </div>

      {/* Summary */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-4 text-xs pt-2 border-t border-border">
        <Skeleton className="h-3 w-16" /> {/* Word count */}
        <Skeleton className="h-3 w-20" /> {/* Chapters */}
        <Skeleton className="h-3 w-16" /> {/* Status */}
        <Skeleton className="h-3 w-12" /> {/* Kudos */}
      </div>
    </div>
  );
}

export function StoryLibrarySkeleton() {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-24" />
      </div>

      {/* Filters skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Story cards skeleton */}
      <div className="grid gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <StoryCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}