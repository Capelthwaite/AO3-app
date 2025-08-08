import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface RefreshStoryRequest {
  workId: string;
  // Updated story data from AO3
  title?: string;
  author?: string;
  summary?: string;
  wordCount?: number;
  chapters: {
    current: number;
    total: number | null;
  };
  isComplete?: boolean;
  lastUpdatedDate?: string;
  kudos?: number;
  bookmarks?: number;
  hits?: number;
}

export async function PUT(request: NextRequest) {
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
    const body: RefreshStoryRequest = await request.json();

    // Validate required fields
    if (!body.workId || !body.chapters) {
      return NextResponse.json(
        { error: 'Missing required story data' },
        { status: 400 }
      );
    }

    // Find the existing story
    const existingStory = await db
      .select()
      .from(userStories)
      .where(
        and(
          eq(userStories.userId, userId),
          eq(userStories.workId, body.workId)
        )
      )
      .limit(1);

    if (existingStory.length === 0) {
      return NextResponse.json(
        { error: 'Story not found in your library' },
        { status: 404 }
      );
    }

    const currentStory = existingStory[0];
    const newChapterCount = body.chapters.current;
    const oldChapterCount = currentStory.currentChapters;

    // Determine if story should be marked as unread
    const hasNewChapters = newChapterCount > currentStory.chaptersReadWhenLastOpened;

    // Update the story with new information
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only update fields that were provided
    if (body.title !== undefined) updateData.title = body.title;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.summary !== undefined) updateData.summary = body.summary;
    if (body.wordCount !== undefined) updateData.wordCount = body.wordCount;
    if (body.isComplete !== undefined) updateData.isComplete = body.isComplete;
    if (body.lastUpdatedDate !== undefined) updateData.lastUpdatedDate = body.lastUpdatedDate;
    if (body.kudos !== undefined) updateData.kudos = body.kudos;
    if (body.bookmarks !== undefined) updateData.bookmarks = body.bookmarks;
    if (body.hits !== undefined) updateData.hits = body.hits;

    // Always update chapter information and reading status
    updateData.currentChapters = newChapterCount;
    updateData.totalChapters = body.chapters.total;
    updateData.isUnread = hasNewChapters;

    await db
      .update(userStories)
      .set(updateData)
      .where(
        and(
          eq(userStories.userId, userId),
          eq(userStories.workId, body.workId)
        )
      );

    // Calculate new chapters for response
    const newChapters = Math.max(0, newChapterCount - currentStory.chaptersReadWhenLastOpened);

    return NextResponse.json({
      success: true,
      message: 'Story updated successfully',
      hasNewChapters,
      newChapters,
      oldChapterCount,
      newChapterCount,
    });

  } catch (error) {
    console.error('Error refreshing story:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}