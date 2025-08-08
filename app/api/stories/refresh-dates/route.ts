import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { userStories } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * This endpoint refreshes date information for existing stories that may have
 * missing or incorrect date data due to previous scraping issues.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Starting refresh-dates request...');
    
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    console.log('Session check:', { hasSession: !!session, hasUser: !!session?.user, userId: session?.user?.id });

    if (!session?.user?.id) {
      console.error('Authentication failed:', { session, user: session?.user });
      return NextResponse.json(
        { error: 'Authentication required. Please ensure you are logged in.' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get all user stories that have missing or placeholder dates
    const stories = await db
      .select()
      .from(userStories)
      .where(eq(userStories.userId, userId));

    let refreshedCount = 0;
    const errors: string[] = [];
    const maxRefreshCount = 10; // Limit to prevent long-running requests

    console.log(`Found ${stories.length} total stories, checking which need refresh...`);

    for (const story of stories) {
      // Safety limit to prevent overwhelming the system
      if (refreshedCount >= maxRefreshCount) {
        console.log(`Reached maximum refresh limit of ${maxRefreshCount} stories, stopping.`);
        errors.push(`Reached maximum refresh limit of ${maxRefreshCount} stories. Run refresh again to process more.`);
        break;
      }
      // Debug: log the actual date values
      console.log(`Story "${story.title}": publishedDate="${story.publishedDate}", lastUpdatedDate="${story.lastUpdatedDate}"`);
      
      // Enhanced detection of stories that need date refreshing
      const needsRefresh = 
        // Missing dates
        !story.lastUpdatedDate || 
        !story.publishedDate ||
        // Empty or placeholder values
        story.lastUpdatedDate === '' ||
        story.publishedDate === '' ||
        story.lastUpdatedDate === 'Unknown' ||
        story.publishedDate === 'Unknown' ||
        // Text indicating unavailable dates
        (story.lastUpdatedDate && story.lastUpdatedDate.toLowerCase().includes('unavailable')) ||
        (story.publishedDate && story.publishedDate.toLowerCase().includes('unavailable')) ||
        (story.lastUpdatedDate && story.lastUpdatedDate.toLowerCase().includes('unknown')) ||
        (story.publishedDate && story.publishedDate.toLowerCase().includes('unknown')) ||
        // Malformed dates that won't parse
        (story.lastUpdatedDate && isNaN(new Date(story.lastUpdatedDate).getTime()) && !story.lastUpdatedDate.match(/^\d{1,2}\s+\w{3}\s+\d{4}$/)) ||
        (story.publishedDate && isNaN(new Date(story.publishedDate).getTime()) && !story.publishedDate.match(/^\d{1,2}\s+\w{3}\s+\d{4}$/)) ||
        // Dates that are clearly fallbacks (current date when story is older)
        (story.lastUpdatedDate && story.lastUpdatedDate === new Date().toISOString().split('T')[0] && 
         story.savedAt && new Date(story.savedAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)); // Saved more than a day ago

      console.log(`Story "${story.title}" needs refresh: ${needsRefresh}`);

      if (needsRefresh) {
        try {
          console.log(`Refreshing dates for story ${story.workId}: "${story.title}"`);
          
          // Fetch fresh data from AO3
          const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const fetchUrl = `${baseUrl}/api/ao3/fetch`;
          console.log(`Fetching fresh data from: ${fetchUrl}?workId=${story.workId}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
          
          const response = await fetch(fetchUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ workId: story.workId }),
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const freshData = result.data;
              
              // Validate that we actually got better date information
              const hasImprovedDates = 
                (freshData.publishedDate && freshData.publishedDate !== 'Unknown' && freshData.publishedDate !== story.publishedDate) ||
                (freshData.lastUpdatedDate && freshData.lastUpdatedDate !== 'Unknown' && freshData.lastUpdatedDate !== story.lastUpdatedDate);
              
              if (hasImprovedDates) {
                // Update the story with fresh date information
                const updateData = {
                  publishedDate: freshData.publishedDate && freshData.publishedDate !== 'Unknown' ? freshData.publishedDate : story.publishedDate,
                  lastUpdatedDate: freshData.lastUpdatedDate && freshData.lastUpdatedDate !== 'Unknown' ? freshData.lastUpdatedDate : story.lastUpdatedDate,
                  // Also update other metadata while we're at it
                  wordCount: freshData.wordCount || story.wordCount,
                  currentChapters: freshData.chapters.current || story.currentChapters,
                  totalChapters: freshData.chapters.total || story.totalChapters,
                  isComplete: freshData.isComplete !== undefined ? freshData.isComplete : story.isComplete,
                  kudos: freshData.kudos || story.kudos,
                  updatedAt: new Date(),
                };
                
                await db
                  .update(userStories)
                  .set(updateData)
                  .where(eq(userStories.id, story.id));

                refreshedCount++;
                console.log(`✅ Refreshed ${story.workId} "${story.title}": published ${updateData.publishedDate}, updated ${updateData.lastUpdatedDate}`);
              } else {
                console.log(`⚠️ No improved dates found for ${story.workId} "${story.title}" - freshData dates: pub="${freshData.publishedDate}", upd="${freshData.lastUpdatedDate}"`);
                errors.push(`No improved dates available for story ${story.workId} "${story.title}"`);
              }
            } else {
              const errorMsg = result.error || 'Unknown error';
              errors.push(`Failed to fetch data for story ${story.workId} "${story.title}": ${errorMsg}`);
              console.error(`❌ Failed to fetch ${story.workId}: ${errorMsg}`);
            }
          } else {
            const errorMsg = `HTTP ${response.status} error fetching story ${story.workId}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
          
          // Rate limiting - wait 2 seconds between requests to be respectful to AO3
          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          let errorMsg: string;
          if (error instanceof Error) {
            if (error.name === 'AbortError') {
              errorMsg = `Timeout refreshing story ${story.workId} "${story.title}" - request took too long`;
            } else {
              errorMsg = `Error refreshing story ${story.workId} "${story.title}": ${error.message}`;
            }
          } else {
            errorMsg = `Unknown error refreshing story ${story.workId} "${story.title}"`;
          }
          
          errors.push(errorMsg);
          console.error(errorMsg);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Date refresh completed. Updated ${refreshedCount} stories.`,
      totalStories: stories.length,
      refreshedCount,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error('Error refreshing story dates:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}