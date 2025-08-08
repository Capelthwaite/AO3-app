import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get total stories count
    const totalStoriesResult = await db
      .select({ count: count() })
      .from(userStories)
      .where(eq(userStories.userId, userId));

    const totalStories = totalStoriesResult[0]?.count || 0;

    // Get currently reading count (incomplete stories)
    const currentlyReadingResult = await db
      .select({ count: count() })
      .from(userStories)
      .where(
        and(
          eq(userStories.userId, userId),
          eq(userStories.isComplete, false)
        )
      );

    const currentlyReading = currentlyReadingResult[0]?.count || 0;

    // Get all stories with their reading progress to calculate updates available
    const storiesWithProgress = await db
      .select()
      .from(userStories)
      .where(eq(userStories.userId, userId));

    // Calculate total new chapters available across all stories
    let totalNewChapters = 0;
    for (const story of storiesWithProgress) {
      const chaptersReadWhenLastOpened = story.chaptersReadWhenLastOpened || story.currentChapters;
      const newChaptersForThisStory = Math.max(0, story.currentChapters - chaptersReadWhenLastOpened);
      totalNewChapters += newChaptersForThisStory;
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalStories,
        currentlyReading,
        updatesAvailable: totalNewChapters,
      },
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}