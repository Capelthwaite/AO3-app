import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Rate limiting - track last request time
let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds as required by AO3 ToS

interface AO3StoryData {
  workId: string;
  title: string;
  author: string;
  summary: string;
  wordCount: number;
  chapters: {
    current: number;
    total: number | null; // null if ongoing
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

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAO3Story(workId: string): Promise<AO3StoryData> {
  // Enforce rate limiting
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await delay(RATE_LIMIT_MS - timeSinceLastRequest);
  }
  lastRequestTime = Date.now();

  const url = `https://archiveofourown.org/works/${workId}`;
  
  try {
    console.log(`Fetching AO3 story: ${url}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Story with ID ${workId} not found`);
      }
      if (response.status === 403) {
        throw new Error(`Story with ID ${workId} is restricted or requires login`);
      }
      throw new Error(`Failed to fetch story: ${response.status} ${response.statusText}`);
    }

    let html = await response.text();
    let $ = cheerio.load(html);

    // Check if story is restricted
    if ($('.error').length > 0) {
      throw new Error('Story is restricted or requires login');
    }

    // Check if we hit an archive warning page and need to proceed
    const isWarningPage = $('.warning').length > 0 || 
                         $('form[action*="proceed"]').length > 0 ||
                         $('input[name="commit"][value="Proceed"]').length > 0 ||
                         $('a[href*="view_adult=true"]').length > 0 ||
                         html.includes('Archive Warning') ||
                         html.includes('view_adult=true') ||
                         html.includes('proceed?');

    if (isWarningPage) {
      console.log(`Archive warning page detected for work ${workId}, proceeding automatically...`);
      
      // Try multiple approaches to bypass archive warnings
      const bypassUrls = [
        `${url}?view_adult=true`,
        `${url}?view_full_work=true`,
        `${url}?view_adult=true&view_full_work=true`,
      ];
      
      // Try each bypass URL until one works
      for (const bypassUrl of bypassUrls) {
        console.log(`Trying bypass URL: ${bypassUrl}`);
        
        // Wait for rate limiting before making another request
        await delay(1000); // Short delay since this is the same story
        
        // Create new controller for the second request
        const adultController = new AbortController();
        const adultTimeoutId = setTimeout(() => adultController.abort(), 30000);
        
        try {
          const adultResponse = await fetch(bypassUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.5',
              'Accept-Encoding': 'gzip, deflate',
              'Connection': 'keep-alive',
              'Upgrade-Insecure-Requests': '1',
            },
            signal: adultController.signal,
          });

          clearTimeout(adultTimeoutId);

          if (adultResponse.ok) {
            const newHtml = await adultResponse.text();
            const new$ = cheerio.load(newHtml);
            
            // Check if this version has a title (indicating success)
            const testTitle = new$('h2.title.heading').text().trim() || 
                             new$('.title.heading').text().trim();
            
            if (testTitle) {
              html = newHtml;
              $ = new$;
              console.log(`Successfully bypassed archive warning for work ${workId} using ${bypassUrl}`);
              break;
            } else {
              console.log(`Bypass URL ${bypassUrl} didn't improve access`);
            }
          } else {
            console.log(`Bypass URL ${bypassUrl} failed with status ${adultResponse.status}`);
          }
        } catch (error) {
          clearTimeout(adultTimeoutId);
          console.log(`Error with bypass URL ${bypassUrl}: ${error}`);
        }
      }
    }

    // Extract story data with more robust selectors for current AO3 structure
    const title = $('h2.title.heading').text().trim() || 
                  $('.title.heading').text().trim() ||
                  $('h2.title').text().trim() || 
                  $('.work h2').text().trim() ||
                  $('#workskin h2').text().trim() ||
                  $('h2:contains("by")').first().text().replace(/\s*by\s.*$/, '').trim();
    
    if (!title) {
      console.error('Failed to extract title for work', workId);
      console.error('Available headings:', $('h1, h2, h3').map((_, el) => $(el).text().trim()).get());
      console.error('Page title:', $('title').text());
      console.error('Body contains "Error":', $('body').text().includes('Error'));
      console.error('Body sample (first 500 chars):', $('body').text().substring(0, 500));
      console.error('Response URL:', url);
      console.error('Response status was OK, HTML length:', html.length);
      throw new Error(`Could not extract story title for work ${workId} - story may be deleted, restricted, or require login`);
    }

    const author = $('a[rel="author"]').first().text().trim() || 
                   $('.byline a').first().text().trim();
    
    // Extract summary while preserving line breaks - try multiple selectors in order of specificity
    let summary = '';
    let summaryElement = $('.summary blockquote.userstuff').first();
    
    // Try alternative selectors if the first one fails
    if (summaryElement.length === 0) {
      summaryElement = $('.summary blockquote').first();
    }
    if (summaryElement.length === 0) {
      summaryElement = $('.summary .userstuff').first();
    }
    if (summaryElement.length === 0) {
      summaryElement = $('.summary').first();
    }
    
    if (summaryElement.length > 0) {
      // Get HTML and convert <p> and <br> tags to line breaks
      const summaryHtml = summaryElement.html() || '';
      summary = summaryHtml
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>/gi, '\n\n')
        .replace(/<p[^>]*>/gi, '')
        .replace(/<[^>]+>/g, '') // Remove any remaining HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\n\n\n+/g, '\n\n') // Normalize multiple line breaks
        .trim();
    }

    // Debug logging for summaries
    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetch ${workId}: Summary found = ${summary.length > 0}, Length = ${summary.length}`);
      if (summary.length === 0) {
        console.log(`  Available summary-related elements:`);
        console.log(`    .summary blockquote.userstuff: ${$('.summary blockquote.userstuff').length}`);
        console.log(`    .summary blockquote: ${$('.summary blockquote').length}`);
        console.log(`    .summary .userstuff: ${$('.summary .userstuff').length}`);
        console.log(`    .summary: ${$('.summary').length}`);
        const summaryHtml = $('.summary').html();
        if (summaryHtml) {
          console.log(`    .summary HTML preview: ${summaryHtml.substring(0, 200)}...`);
        }
      }
    }
    
    // Final fallback to text-only extraction
    if (!summary) {
      summary = $('.summary').text().trim();
    }
    
    console.log(`Extracted basic info: title="${title}", author="${author}"`);
    
    // Extract stats with more flexible parsing
    const statsContainer = $('.stats, .work-stats, #workskin .stats');
    let wordCount = 0;
    const chapters = { current: 1, total: null as number | null };
    let isComplete = false;
    let kudos = 0;
    let bookmarks = 0;
    let hits = 0;

    // Try to extract stats from different possible locations
    const statsText = statsContainer.text() || $('.metadata').text() || $('body').text();
    console.log('Stats text sample:', statsText.substring(0, 500));

    // Word count
    const wordCountMatch = statsText.match(/Words?:\s*(\d+(?:,\d+)*)/i) || 
                          statsText.match(/(\d+(?:,\d+)*)\s*words?/i);
    if (wordCountMatch) {
      wordCount = parseInt(wordCountMatch[1].replace(/,/g, ''));
    }
    
    // Chapters
    const chaptersMatch = statsText.match(/Chapters?:\s*(\d+)(?:\/(\d+|\?))?/i);
    if (chaptersMatch) {
      chapters.current = parseInt(chaptersMatch[1]);
      if (chaptersMatch[2] && chaptersMatch[2] !== '?') {
        chapters.total = parseInt(chaptersMatch[2]);
        isComplete = chapters.current === chapters.total;
      }
    }

    // Extract tags with flexible selectors
    const fandom = $('.fandom .tag, .fandom.tags .tag, [class*="fandom"] .tag').map((_, el) => $(el).text().trim()).get();
    const relationships = $('.relationship .tag, .relationship.tags .tag, [class*="relationship"] .tag').map((_, el) => $(el).text().trim()).get();
    const characters = $('.character .tag, .character.tags .tag, [class*="character"] .tag').map((_, el) => $(el).text().trim()).get();
    const additionalTags = $('.freeform .tag, .freeform.tags .tag, [class*="freeform"] .tag, .additional .tag').map((_, el) => $(el).text().trim()).get();

    // Extract dates from AO3 Stats section with comprehensive parsing
    let publishedDate = '';
    let lastUpdatedDate = '';
    
    // Helper function to parse various date formats and normalize to YYYY-MM-DD
    function parseAO3Date(dateStr: string): string | null {
      if (!dateStr) return null;
      
      // Clean up the date string
      const cleaned = dateStr.replace(/^(Published:|Updated:|Last updated:|Completed:)\s*/i, '').trim();
      
      console.log(`Parsing date string: "${cleaned}"`);
      
      // Pattern 1: YYYY-MM-DD (ISO format)
      const isoMatch = cleaned.match(/(\d{4}-\d{2}-\d{2})/);
      if (isoMatch) {
        console.log(`Found ISO date: ${isoMatch[1]}`);
        return isoMatch[1];
      }
      
      // Pattern 2: DD Mon YYYY (AO3 common format)
      const ddMonYyyyMatch = cleaned.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
      if (ddMonYyyyMatch) {
        const [, day, month, year] = ddMonYyyyMatch;
        const monthNum = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }[month];
        if (monthNum) {
          const formatted = `${year}-${monthNum}-${day.padStart(2, '0')}`;
          console.log(`Converted DD Mon YYYY "${cleaned}" to ISO: ${formatted}`);
          return formatted;
        }
      }
      
      // Pattern 3: Mon DD, YYYY
      const monDdYyyyMatch = cleaned.match(/(\w{3})\s+(\d{1,2}),\s+(\d{4})/);
      if (monDdYyyyMatch) {
        const [, month, day, year] = monDdYyyyMatch;
        const monthNum = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
        }[month];
        if (monthNum) {
          const formatted = `${year}-${monthNum}-${day.padStart(2, '0')}`;
          console.log(`Converted Mon DD, YYYY "${cleaned}" to ISO: ${formatted}`);
          return formatted;
        }
      }
      
      // Pattern 4: Full month names (January 12, 2023)
      const fullMonthMatch = cleaned.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/);
      if (fullMonthMatch) {
        const [, month, day, year] = fullMonthMatch;
        const monthNum = {
          'January': '01', 'February': '02', 'March': '03', 'April': '04', 'May': '05', 'June': '06',
          'July': '07', 'August': '08', 'September': '09', 'October': '10', 'November': '11', 'December': '12'
        }[month];
        if (monthNum) {
          const formatted = `${year}-${monthNum}-${day.padStart(2, '0')}`;
          console.log(`Converted full month "${cleaned}" to ISO: ${formatted}`);
          return formatted;
        }
      }
      
      // Pattern 5: Try JavaScript Date parsing as last resort
      try {
        const jsDate = new Date(cleaned);
        if (!isNaN(jsDate.getTime()) && jsDate.getFullYear() > 2000 && jsDate.getFullYear() < 2100) {
          const formatted = jsDate.toISOString().split('T')[0];
          console.log(`JS Date parsing "${cleaned}" to ISO: ${formatted}`);
          return formatted;
        }
      } catch {
        console.log(`JS Date parsing failed for "${cleaned}"`);
      }
      
      console.log(`Could not parse date: "${cleaned}"`);
      return null;
    }
    
    // Try to extract dates from multiple locations in the HTML
    const dateStatsText = $('.stats').text() + ' ' + $('.work-stats').text() + ' ' + $('.metadata').text();
    console.log('Date stats text sample:', dateStatsText.substring(0, 300));
    
    // Method 1: Direct text pattern matching in stats
    const publishedPatterns = [
      /Published:\s*([^,\n]+?)(?:,|\n|$)/i,
      /Publication date:\s*([^,\n]+?)(?:,|\n|$)/i,
      /Date published:\s*([^,\n]+?)(?:,|\n|$)/i
    ];
    
    const updatedPatterns = [
      /Updated:\s*([^,\n]+?)(?:,|\n|$)/i,
      /Last updated:\s*([^,\n]+?)(?:,|\n|$)/i,
      /Completed:\s*([^,\n]+?)(?:,|\n|$)/i,
      /Date completed:\s*([^,\n]+?)(?:,|\n|$)/i
    ];
    
    // Try to find published date
    for (const pattern of publishedPatterns) {
      const match = dateStatsText.match(pattern);
      if (match) {
        const parsed = parseAO3Date(match[1]);
        if (parsed) {
          publishedDate = parsed;
          break;
        }
      }
    }
    
    // Try to find updated date
    for (const pattern of updatedPatterns) {
      const match = dateStatsText.match(pattern);
      if (match) {
        const parsed = parseAO3Date(match[1]);
        if (parsed) {
          lastUpdatedDate = parsed;
          break;
        }
      }
    }
    
    // Method 2: HTML element structure parsing
    if (!publishedDate || !lastUpdatedDate) {
      console.log('Trying HTML element structure parsing...');
      
      // Look for dt/dd pairs in stats section
      $('.stats dl dt, .metadata dl dt, .work-stats dl dt').each((_, dt) => {
        const $dt = $(dt);
        const text = $dt.text().toLowerCase().trim();
        const $dd = $dt.next('dd');
        const dateValue = $dd.text().trim();
        
        console.log(`Found dt/dd pair: "${text}" -> "${dateValue}"`);
        
        if ((text.includes('published') || text.includes('publication')) && !publishedDate) {
          const parsed = parseAO3Date(dateValue);
          if (parsed) {
            publishedDate = parsed;
            console.log(`Extracted published date from dt/dd: ${parsed}`);
          }
        } else if ((text.includes('updated') || text.includes('completed')) && !lastUpdatedDate) {
          const parsed = parseAO3Date(dateValue);
          if (parsed) {
            lastUpdatedDate = parsed;
            console.log(`Extracted updated date from dt/dd: ${parsed}`);
          }
        }
      });
    }
    
    // Method 3: Try alternative CSS selectors
    if (!publishedDate || !lastUpdatedDate) {
      console.log('Trying alternative CSS selectors...');
      
      // Try different stat section layouts
      const statSelectors = [
        '.stats .published', '.stats .updated', '.stats .completed',
        '.work-stats .published', '.work-stats .updated', '.work-stats .completed',
        '.metadata .published', '.metadata .updated', '.metadata .completed'
      ];
      
      for (const selector of statSelectors) {
        const element = $(selector);
        if (element.length > 0) {
          const text = element.text().trim();
          const parsed = parseAO3Date(text);
          if (parsed) {
            if (selector.includes('published') && !publishedDate) {
              publishedDate = parsed;
              console.log(`Found published date via selector ${selector}: ${parsed}`);
            } else if ((selector.includes('updated') || selector.includes('completed')) && !lastUpdatedDate) {
              lastUpdatedDate = parsed;
              console.log(`Found updated date via selector ${selector}: ${parsed}`);
            }
          }
        }
      }
    }
    
    // Enhanced fallback logic with intelligent date handling
    console.log(`Date extraction results before fallback: published="${publishedDate}", updated="${lastUpdatedDate}"`);
    
    if (!publishedDate && !lastUpdatedDate) {
      // Last resort: try to extract any date-like pattern from the entire page
      console.log('No dates found with primary methods, trying page-wide date extraction...');
      
      const pageText = $('body').text();
      const datePatterns = [
        /(\d{4}-\d{2}-\d{2})/g,
        /(\d{1,2})\s+(\w{3})\s+(\d{4})/g,
        /(\w{3})\s+(\d{1,2}),\s+(\d{4})/g
      ];
      
      for (const pattern of datePatterns) {
        const matches = Array.from(pageText.matchAll(pattern));
        if (matches.length > 0) {
          // Take the first reasonable date found
          const firstMatch = matches[0];
          let candidateDate = '';
          
          if (pattern === datePatterns[0]) { // ISO format
            candidateDate = firstMatch[1];
          } else {
            candidateDate = firstMatch[0];
          }
          
          const parsed = parseAO3Date(candidateDate);
          if (parsed) {
            // Validate it's a reasonable publication date (not too old, not in the future)
            const dateObj = new Date(parsed);
            const currentDate = new Date();
            const minDate = new Date('2008-01-01'); // AO3 launched in 2008
            
            if (dateObj >= minDate && dateObj <= currentDate) {
              console.log(`Found reasonable fallback date: ${parsed}`);
              publishedDate = parsed;
              lastUpdatedDate = parsed;
              break;
            }
          }
        }
      }
    }
    
    // Final fallback strategy
    if (!publishedDate && !lastUpdatedDate) {
      console.warn(`Absolutely no dates found for work ${workId}, this story may be corrupted or have unusual formatting`);
      // Use a placeholder that will be caught by the refresh mechanism
      publishedDate = 'Unknown';
      lastUpdatedDate = 'Unknown';
    } else if (!publishedDate) {
      // If we have updated but not published, use updated as published (common for one-shots)
      publishedDate = lastUpdatedDate;
      console.log(`Using updated date as published date: ${publishedDate}`);
    } else if (!lastUpdatedDate) {
      // If we have published but not updated, use published as updated (story hasn't been updated)
      lastUpdatedDate = publishedDate;
      console.log(`Using published date as updated date: ${lastUpdatedDate}`);
    }
    
    // Validate final dates make sense (updated >= published)
    if (publishedDate !== 'Unknown' && lastUpdatedDate !== 'Unknown') {
      const pubDate = new Date(publishedDate);
      const updDate = new Date(lastUpdatedDate);
      
      if (pubDate > updDate) {
        console.log(`Published date ${publishedDate} is after updated date ${lastUpdatedDate}, swapping them`);
        [publishedDate, lastUpdatedDate] = [lastUpdatedDate, publishedDate];
      }
    }

    // Extract engagement stats
    const kudosMatch = statsText.match(/Kudos?:\s*(\d+(?:,\d+)*)/i);
    if (kudosMatch) kudos = parseInt(kudosMatch[1].replace(/,/g, ''));
    
    const bookmarksMatch = statsText.match(/Bookmarks?:\s*(\d+(?:,\d+)*)/i);
    if (bookmarksMatch) bookmarks = parseInt(bookmarksMatch[1].replace(/,/g, ''));
    
    const hitsMatch = statsText.match(/Hits?:\s*(\d+(?:,\d+)*)/i);
    if (hitsMatch) hits = parseInt(hitsMatch[1].replace(/,/g, ''));

    console.log(`Extracted stats: words=${wordCount}, chapters=${chapters.current}/${chapters.total}, kudos=${kudos}`);
    console.log(`Extracted dates: published="${publishedDate}", updated="${lastUpdatedDate}"`);

    return {
      workId,
      title,
      author,
      summary,
      wordCount,
      chapters,
      isComplete,
      fandom,
      relationships,
      characters,
      additionalTags,
      publishedDate,
      lastUpdatedDate,
      kudos,
      bookmarks,
      hits,
      url,
    };

  } catch (error) {
    console.error(`Error fetching AO3 story ${workId}:`, error);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out while fetching story ${workId}. This might be due to AO3 rate limiting or the story being very large.`);
      }
      throw error;
    }
    throw new Error(`Unknown error occurred while fetching story ${workId}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('AO3 fetch POST request received');
    const body = await request.json();
    console.log('Request body:', body);
    const { workId, url } = body;

    // Extract work ID from URL if provided (handles both work URLs and chapter URLs)
    let storyId = workId;
    if (url && !workId) {
      const urlMatch = url.match(/archiveofourown\.org\/works\/(\d+)/);
      if (urlMatch) {
        storyId = urlMatch[1];
        console.log(`Extracted work ID ${storyId} from URL: ${url}`);
      } else {
        return NextResponse.json(
          { error: 'Invalid AO3 URL format. Please use a URL like https://archiveofourown.org/works/12345 or https://archiveofourown.org/works/12345/chapters/67890' },
          { status: 400 }
        );
      }
    }

    if (!storyId) {
      return NextResponse.json(
        { error: 'Work ID or URL is required' },
        { status: 400 }
      );
    }

    console.log(`Fetching AO3 story with ID: ${storyId}`);
    const storyData = await fetchAO3Story(storyId);
    console.log(`Successfully fetched story ${storyId}: ${storyData.title}`);
    
    return NextResponse.json({
      success: true,
      data: storyData,
    });

  } catch (error) {
    console.error('AO3 fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Allow GET requests for testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workId = searchParams.get('workId');
  const url = searchParams.get('url');

  if (!workId && !url) {
    return NextResponse.json(
      { error: 'Work ID or URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Extract work ID from URL if provided (handles both work URLs and chapter URLs)
    let storyId = workId;
    if (url && !workId) {
      const urlMatch = url.match(/archiveofourown\.org\/works\/(\d+)/);
      if (urlMatch) {
        storyId = urlMatch[1];
        console.log(`Extracted work ID ${storyId} from URL: ${url}`);
      } else {
        return NextResponse.json(
          { error: 'Invalid AO3 URL format. Please use a URL like https://archiveofourown.org/works/12345 or https://archiveofourown.org/works/12345/chapters/67890' },
          { status: 400 }
        );
      }
    }

    const storyData = await fetchAO3Story(storyId!);
    
    return NextResponse.json({
      success: true,
      data: storyData,
    });

  } catch (error) {
    console.error('AO3 fetch error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}