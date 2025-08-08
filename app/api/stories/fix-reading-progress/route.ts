import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * This endpoint fixes existing stories that were saved before the reading progress feature
 * It assumes that users have read all chapters that were available when they saved the story
 */
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

    // Get all user stories that might need fixing
    const stories = await db
      .select()
      .from(userStories)
      .where(eq(userStories.userId, userId));

    let fixedCount = 0;

    for (const story of stories) {
      // Check if the story needs fixing (has null or 0 values for reading progress fields)
      const needsFix = 
        !story.chaptersReadWhenSaved || 
        !story.chaptersReadWhenLastOpened || 
        story.chaptersReadWhenSaved < story.currentChapters ||
        story.chaptersReadWhenLastOpened < story.chaptersReadWhenSaved;

      if (needsFix) {
        // Fix the story: assume user has read all current chapters when they saved it
        await db
          .update(userStories)
          .set({
            chaptersReadWhenSaved: story.currentChapters,
            chaptersReadWhenLastOpened: story.currentChapters,
            lastOpenedAt: story.savedAt, // Use savedAt as the last opened date
            isUnread: false, // Mark as caught up
            updatedAt: new Date(),
          })
          .where(eq(userStories.id, story.id));

        fixedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Fixed reading progress for ${fixedCount} stories`,
      totalStories: stories.length,
      fixedCount,
    });

  } catch (error) {
    console.error('Error fixing reading progress:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}