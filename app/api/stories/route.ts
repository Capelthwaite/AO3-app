import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

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

    // Get user's saved stories, ordered by most recently saved
    const stories = await db
      .select()
      .from(userStories)
      .where(eq(userStories.userId, userId))
      .orderBy(desc(userStories.savedAt));

    // Parse JSON fields back to arrays and add reading progress calculations
    const formattedStories = stories.map(story => {
      // Calculate reading progress
      const chaptersReadWhenSaved = story.chaptersReadWhenSaved || story.currentChapters;
      const chaptersReadWhenLastOpened = story.chaptersReadWhenLastOpened || story.currentChapters;
      const currentChapters = story.currentChapters;
      
      // Calculate new chapters since last read
      const newChaptersSinceLastRead = Math.max(0, currentChapters - chaptersReadWhenLastOpened);
      
      // Determine if story has updates
      const hasUnreadUpdates = story.isUnread || newChaptersSinceLastRead > 0;
      
      // Calculate progress info
      const totalChapters = story.totalChapters || currentChapters;
      const readProgress = chaptersReadWhenLastOpened / totalChapters;
      
      return {
        ...story,
        fandom: story.fandom ? JSON.parse(story.fandom) : [],
        relationships: story.relationships ? JSON.parse(story.relationships) : [],
        characters: story.characters ? JSON.parse(story.characters) : [],
        additionalTags: story.additionalTags ? JSON.parse(story.additionalTags) : [],
        
        // Reading Progress Information
        readingProgress: {
          chaptersReadWhenSaved,
          chaptersReadWhenLastOpened,
          currentChapters,
          totalChapters,
          newChaptersSinceLastRead,
          hasUnreadUpdates,
          readProgress: Math.round(readProgress * 100), // Percentage
          isFullyRead: chaptersReadWhenLastOpened >= currentChapters,
          lastOpenedAt: story.lastOpenedAt,
        }
      };
    });

    return NextResponse.json({
      success: true,
      stories: formattedStories,
    });

  } catch (error) {
    console.error('Error fetching user stories:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}