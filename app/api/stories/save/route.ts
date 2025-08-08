import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface SaveStoryRequest {
  workId: string;
  title: string;
  author: string;
  summary: string;
  wordCount: number;
  chapters: {
    current: number;
    total: number | null;
  };
  isComplete: boolean;
  fandom: string[];
  relationships: string[];
  characters: string[];
  additionalTags: string[];
  publishedDate: string;
  lastUpdatedDate: string;
  kudos: number;
  bookmarks: number;
  hits: number;
  url: string;
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
    const body: SaveStoryRequest = await request.json();

    // Validate required fields
    if (!body.workId || !body.title || !body.author || !body.url) {
      return NextResponse.json(
        { error: 'Missing required story data' },
        { status: 400 }
      );
    }

    // Check if story is already saved by this user
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

    if (existingStory.length > 0) {
      return NextResponse.json(
        { error: 'Story is already saved to your library' },
        { status: 409 }
      );
    }

    // Save the story with reading progress tracking
    const storyId = nanoid();
    const currentChapterCount = body.chapters.current || 1;
    
    await db.insert(userStories).values({
      id: storyId,
      userId,
      workId: body.workId,
      title: body.title,
      author: body.author,
      summary: body.summary || '',
      wordCount: body.wordCount || 0,
      currentChapters: currentChapterCount,
      totalChapters: body.chapters.total,
      isComplete: body.isComplete || false,
      fandom: JSON.stringify(body.fandom || []),
      relationships: JSON.stringify(body.relationships || []),
      characters: JSON.stringify(body.characters || []),
      additionalTags: JSON.stringify(body.additionalTags || []),
      publishedDate: body.publishedDate || '',
      lastUpdatedDate: body.lastUpdatedDate || '',
      kudos: body.kudos || 0,
      bookmarks: body.bookmarks || 0,
      hits: body.hits || 0,
      url: body.url,
      
      // Reading Progress Tracking: Assume user has read ALL current chapters when saving
      chaptersReadWhenSaved: currentChapterCount, // All chapters available when saved
      chaptersReadWhenLastOpened: currentChapterCount, // Assume they're caught up when saving
      lastOpenedAt: new Date(), // Mark as "read" at time of saving
      isUnread: false, // Just saved and caught up, so not unread
    });

    return NextResponse.json({
      success: true,
      message: 'Story saved to your library successfully',
      storyId,
    });

  } catch (error) {
    console.error('Error saving story:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}