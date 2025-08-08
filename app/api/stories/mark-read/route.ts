import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

interface MarkReadRequest {
  workId: string;
}

export async function POST(request: NextRequest) {
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
    const body: MarkReadRequest = await request.json();

    // Validate required fields
    if (!body.workId) {
      return NextResponse.json(
        { error: 'workId is required' },
        { status: 400 }
      );
    }

    // Find the story
    const story = await db
      .select()
      .from(userStories)
      .where(
        and(
          eq(userStories.userId, userId),
          eq(userStories.workId, body.workId)
        )
      )
      .limit(1);

    if (story.length === 0) {
      return NextResponse.json(
        { error: 'Story not found in your library' },
        { status: 404 }
      );
    }

    const currentStory = story[0];

    // Update reading progress: mark as read up to current chapters
    await db
      .update(userStories)
      .set({
        chaptersReadWhenLastOpened: currentStory.currentChapters,
        lastOpenedAt: new Date(),
        isUnread: false, // Mark as read
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userStories.userId, userId),
          eq(userStories.workId, body.workId)
        )
      );

    return NextResponse.json({
      success: true,
      message: 'Story marked as read',
    });

  } catch (error) {
    console.error('Error marking story as read:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}