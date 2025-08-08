import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Rate limiting - track last request time
let lastSearchTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds as required by AO3 ToS

interface SearchFilters {
  query?: string;
  fandom?: string | string[]; // Support both single and multiple fandoms
  characters?: string[]; // Support multiple characters
  complete?: 'true' | 'false' | '';
  words_from?: string;
  words_to?: string;
  kudos_from?: string;
  sort_column?: 'revised_at' | 'kudos_count' | 'hits' | 'bookmarks_count' | 'comments_count';
  page?: string;
}

interface AO3SearchResult {
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

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function searchAO3Stories(filters: SearchFilters): Promise<{
  stories: AO3SearchResult[];
  totalPages: number;
  currentPage: number;
}> {
  // Enforce rate limiting
  const now = Date.now();
  const timeSinceLastSearch = now - lastSearchTime;
  if (timeSinceLastSearch < RATE_LIMIT_MS) {
    await delay(RATE_LIMIT_MS - timeSinceLastSearch);
  }
  lastSearchTime = Date.now();

  // Build search URL
  const baseUrl = 'https://archiveofourown.org/works';
  
  // Use URLSearchParams for proper encoding
  const params = new URLSearchParams();
  
  // Add search parameters
  let searchQuery = filters.query || '';
  
  // Add kudos filter to the search query if specified
  if (filters.kudos_from) {
    const kudosFilter = `kudos > ${parseInt(filters.kudos_from) - 1}`;
    searchQuery = searchQuery ? `${searchQuery} ${kudosFilter}` : kudosFilter;
  }
  
  if (searchQuery) params.append('work_search[query]', searchQuery);
  
  // Handle single fandom search (multi-fandom is handled elsewhere)

  // Handle single fandom or no fandom
  if (filters.fandom) {
    if (Array.isArray(filters.fandom)) {
      filters.fandom.forEach(fandom => {
        if (fandom.trim()) {
          console.log(`Adding fandom tag: "${fandom.trim()}"`);
          params.append('tag_id', fandom.trim());
        }
      });
    } else {
      // Handle comma-separated string (legacy support)
      const fandoms = filters.fandom.split(',').map(f => f.trim()).filter(f => f);
      fandoms.forEach(fandom => {
        console.log(`Adding fandom tag: "${fandom}"`);
        params.append('tag_id', fandom);
      });
    }
  }

  // Handle character tags for single fandom searches
  if (filters.characters && filters.characters.length > 0) {
    filters.characters.forEach(character => {
      if (character.trim()) {
        params.append('tag_id', character.trim());
      }
    });
  }
  
  if (filters.complete) params.append('work_search[complete]', filters.complete);
  if (filters.words_from) params.append('work_search[words_from]', filters.words_from);
  if (filters.words_to) params.append('work_search[words_to]', filters.words_to);
  if (filters.sort_column) params.append('work_search[sort_column]', filters.sort_column);
  if (filters.page) params.append('page', filters.page);
  
  params.append('commit', 'Sort and Filter');
  
  const searchUrl = `${baseUrl}?${params.toString()}`;
  
  try {
    console.log(`Searching AO3: ${searchUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(searchUrl, {
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
      throw new Error(`Failed to search AO3: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Parse pagination info
    const paginationText = $('.pagination .current').text() || '1';
    const currentPage = parseInt(paginationText);
    
    // Better pagination parsing - look for "Next" link or highest page number
    let totalPages = 1;
    const paginationLinks = $('.pagination a');
    if (paginationLinks.length > 0) {
      // Find the highest page number in pagination links
      const pageNumbers = paginationLinks.map((_, el) => {
        const href = $(el).attr('href');
        const match = href?.match(/page=(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }).get().filter(num => num > 0);
      
      if (pageNumbers.length > 0) {
        totalPages = Math.max(...pageNumbers);
      }
    }
    
    // If no pagination found but we have results, assume at least this page exists
    if ($('.work.blurb').length > 0) {
      totalPages = Math.max(totalPages, currentPage);
    }

    // Parse search results
    const stories: AO3SearchResult[] = [];
    
    $('.work.blurb').each((_, element) => {
      try {
        const $work = $(element);
        
        // Extract work ID from the data-work-id attribute or href
        const workId = $work.attr('data-work-id') || 
                     $work.find('.header h4 a').attr('href')?.match(/\/works\/(\d+)/)?.[1] || '';
        
        if (!workId) return;
        
        // Extract basic info
        const title = $work.find('.header h4 a').first().text().trim();
        const author = $work.find('.header .heading a[rel="author"]').first().text().trim();
        
        // Extract summary - try multiple selectors in order of specificity
        let summary = '';
        let summaryElement = $work.find('.summary blockquote.userstuff');
        
        // Try alternative selectors if the first one fails
        if (summaryElement.length === 0) {
          summaryElement = $work.find('.summary blockquote');
        }
        if (summaryElement.length === 0) {
          summaryElement = $work.find('.summary .userstuff');
        }
        if (summaryElement.length === 0) {
          summaryElement = $work.find('.summary');
        }
        
        if (summaryElement.length > 0) {
          const summaryHtml = summaryElement.html() || '';
          summary = summaryHtml
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<p[^>]*>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/&quot;/g, '"')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .replace(/\n+/g, '\n')
            .trim();
        }
        
        // Debug logging for summaries
        if (process.env.NODE_ENV === 'development') {
          console.log(`Work ${workId} (${title}): Summary found = ${summary.length > 0}, Length = ${summary.length}`);
          if (summary.length === 0) {
            console.log(`  Available summary-related elements:`);
            console.log(`    .summary blockquote.userstuff: ${$work.find('.summary blockquote.userstuff').length}`);
            console.log(`    .summary blockquote: ${$work.find('.summary blockquote').length}`);
            console.log(`    .summary .userstuff: ${$work.find('.summary .userstuff').length}`);
            console.log(`    .summary: ${$work.find('.summary').length}`);
            console.log(`    Full .summary HTML:`, $work.find('.summary').html());
          }
        }
        
        // Extract stats
        const statsText = $work.find('.stats').text();
        
        // Word count
        const wordCountMatch = statsText.match(/Words:\s*(\d+(?:,\d+)*)/i);
        const wordCount = wordCountMatch ? parseInt(wordCountMatch[1].replace(/,/g, '')) : 0;
        
        // Chapters
        const chaptersMatch = statsText.match(/Chapters:\s*(\d+)(?:\/(\d+|\?))?/i);
        const chapters = {
          current: chaptersMatch ? parseInt(chaptersMatch[1]) : 1,
          total: chaptersMatch && chaptersMatch[2] && chaptersMatch[2] !== '?' ? 
                 parseInt(chaptersMatch[2]) : null
        };
        
        const isComplete = chapters.total ? chapters.current === chapters.total : false;
        
        // Extract tags
        const fandom = $work.find('.fandoms .tag').map((_, el) => $(el).text().trim()).get();
        const relationships = $work.find('.relationships .tag').map((_, el) => $(el).text().trim()).get();
        const characters = $work.find('.characters .tag').map((_, el) => $(el).text().trim()).get();
        const additionalTags = $work.find('.freeforms .tag').map((_, el) => $(el).text().trim()).get();
        
        // Extract dates
        const publishedDate = $work.find('.datetime').first().text().trim();
        const lastUpdatedDate = $work.find('.datetime').last().text().trim();
        
        // Extract engagement stats
        const kudosMatch = statsText.match(/Kudos:\s*(\d+(?:,\d+)*)/i);
        const kudos = kudosMatch ? parseInt(kudosMatch[1].replace(/,/g, '')) : 0;
        
        const bookmarksMatch = statsText.match(/Bookmarks:\s*(\d+(?:,\d+)*)/i);
        const bookmarks = bookmarksMatch ? parseInt(bookmarksMatch[1].replace(/,/g, '')) : 0;
        
        const hitsMatch = statsText.match(/Hits:\s*(\d+(?:,\d+)*)/i);
        const hits = hitsMatch ? parseInt(hitsMatch[1].replace(/,/g, '')) : 0;
        
        stories.push({
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
          url: `https://archiveofourown.org/works/${workId}`,
        });
        
      } catch (error) {
        console.error('Error parsing work:', error);
      }
    });

    // Apply relationship filtering after getting results
    let filteredStories = stories;
    if (filters.characters && filters.characters.length > 0) {
      filteredStories = filterStoriesByRelationships(filteredStories, filters.characters);
    }

    return {
      stories: filteredStories,
      totalPages,
      currentPage,
    };

  } catch (error) {
    console.error('Error searching AO3:', error);
    throw error;
  }
}

// Build OR query for multiple fandoms
function buildFandomOrQuery(fandoms: string[], existingQuery?: string): string {
  // Build OR query with proper escaping - use exact fandom names in quotes
  const fandomQuery = fandoms.map(fandom => `"${fandom}"`).join(' OR ');
  
  // Combine with existing query if present
  if (existingQuery?.trim()) {
    return `(${fandomQuery}) AND (${existingQuery})`;
  }
  
  return fandomQuery;
}

// Filter results to ensure they contain at least one of the target fandoms
function filterStoriesByFandom(stories: AO3SearchResult[], targetFandoms: string[]): AO3SearchResult[] {
  console.log(`Filtering ${stories.length} stories for fandoms: ${targetFandoms.join(', ')}`);
  
  const filtered = stories.filter(story => {
    // Check if story has at least one of the target fandoms
    const hasMatchingFandom = story.fandom.some(storyFandom => 
      targetFandoms.some(targetFandom => {
        // Normalize for comparison - handle variations in fandom names
        const normalizedStoryFandom = storyFandom.toLowerCase().trim();
        const normalizedTargetFandom = targetFandom.toLowerCase().trim();
        
        // More flexible matching for common variations
        const storyWords = normalizedStoryFandom.split(/[\s\-_:()]+/).filter(w => w.length > 1);
        const targetWords = normalizedTargetFandom.split(/[\s\-_:()]+/).filter(w => w.length > 1);
        
        // Check exact match first
        if (normalizedStoryFandom === normalizedTargetFandom) return true;
        
        // Check substring matches
        if (normalizedStoryFandom.includes(normalizedTargetFandom) ||
            normalizedTargetFandom.includes(normalizedStoryFandom)) return true;
        
        // Check if most significant words match (like "arcane", "league", "legends")
        const matchingWords = targetWords.filter(targetWord => 
          storyWords.some(storyWord => 
            storyWord.includes(targetWord) || targetWord.includes(storyWord)
          )
        );
        
        // If most of the key words match, consider it a match
        return matchingWords.length >= Math.min(2, targetWords.length * 0.6);
      })
    );
    
    if (hasMatchingFandom) {
      console.log(`✓ Story "${story.title}" matched fandom: [${story.fandom.join(', ')}]`);
    }
    
    return hasMatchingFandom;
  });
  
  console.log(`Filtered to ${filtered.length} stories`);
  return filtered;
}

// Filter results to ensure they contain at least one of the target relationships
function filterStoriesByRelationships(stories: AO3SearchResult[], targetRelationships: string[]): AO3SearchResult[] {
  if (!targetRelationships || targetRelationships.length === 0) {
    return stories; // No relationship filtering requested
  }
  
  console.log(`Filtering ${stories.length} stories for relationships: ${targetRelationships.join(', ')}`);
  
  const filtered = stories.filter(story => {
    // Check if story has at least one of the target relationships
    const hasMatchingRelationship = story.relationships.some(storyRelationship => 
      targetRelationships.some(targetRelationship => {
        // Normalize for comparison - handle variations in relationship names
        const normalizedStoryRel = storyRelationship.toLowerCase().trim();
        const normalizedTargetRel = targetRelationship.toLowerCase().trim();
        
        // Check exact match first
        if (normalizedStoryRel === normalizedTargetRel) return true;
        
        // Check substring matches (for variations like "Kara Danvers/Lena Luthor" vs "Kara/Lena")
        if (normalizedStoryRel.includes(normalizedTargetRel) ||
            normalizedTargetRel.includes(normalizedStoryRel)) return true;
        
        // Handle name variations and different orderings
        const storyWords = normalizedStoryRel.split(/[\s\-_:/&]+/).filter(w => w.length > 1);
        const targetWords = normalizedTargetRel.split(/[\s\-_:/&]+/).filter(w => w.length > 1);
        
        // Check if most significant words match
        const matchingWords = targetWords.filter(targetWord => 
          storyWords.some(storyWord => 
            storyWord.includes(targetWord) || targetWord.includes(storyWord)
          )
        );
        
        // If most words match, consider it a match (allows for name variations)
        return matchingWords.length >= Math.min(2, targetWords.length * 0.7);
      })
    );
    
    if (hasMatchingRelationship) {
      console.log(`✓ Story "${story.title}" matched relationship: [${story.relationships.join(', ')}]`);
    }
    
    return hasMatchingRelationship;
  });
  
  console.log(`Filtered to ${filtered.length} stories`);
  return filtered;
}

// Fast function to get total count from a fandom (only fetches first page)
async function getFandomTotalCount(filters: SearchFilters, fandom: string): Promise<number> {
  try {
    const singleFandomFilters: SearchFilters = {
      ...filters,
      fandom: [fandom],
      characters: undefined, // Remove character filters to get accurate base count
      page: '1',
    };
    
    const results = await searchAO3Stories(singleFandomFilters);
    const totalEstimate = results.totalPages * 20; // AO3 typically shows ~20 stories per page
    
    console.log(`Fandom ${fandom}: ${results.totalPages} pages, estimated ${totalEstimate} total stories`);
    return totalEstimate;
  } catch (error) {
    console.error(`Error getting total count for fandom ${fandom}:`, error);
    return 0;
  }
}

// Improved approach: Fetch enough stories to properly paginate with correct sorting
async function fetchStoriesForPagination(filters: SearchFilters, requestedPage: number): Promise<{
  stories: AO3SearchResult[];
  totalEstimate: number;
}> {
  const allStories: AO3SearchResult[] = [];
  let totalEstimate = 0;
  
  // First, quickly get total counts from all fandoms (parallel requests)
  console.log('Getting total counts from all fandoms...');
  const countPromises = (filters.fandom as string[]).map(fandom => 
    getFandomTotalCount(filters, fandom)
  );
  const fandomCounts = await Promise.all(countPromises);
  totalEstimate = fandomCounts.reduce((sum, count) => sum + count, 0);
  
  console.log(`Total estimated stories across all fandoms: ${totalEstimate}`);
  
  // Calculate how many stories we need to fetch to cover the requested page
  // We need at least (requestedPage * 20) stories to properly paginate
  const storiesNeeded = requestedPage * 20 + 20; // Extra buffer for filtering
  const pagesToFetchPerFandom = Math.max(2, Math.ceil(storiesNeeded / (filters.fandom as string[]).length / 20));
  
  console.log(`Fetching ${pagesToFetchPerFandom} pages from each fandom for page ${requestedPage} (need ${storiesNeeded} stories)`);
  
  // Fetch stories from all fandoms in parallel
  const fetchPromises = (filters.fandom as string[]).map(async (fandom) => {
    const fandomStories: AO3SearchResult[] = [];
    
    for (let page = 1; page <= pagesToFetchPerFandom; page++) {
      try {
        const singleFandomFilters: SearchFilters = {
          ...filters,
          fandom: [fandom],
          characters: undefined, // Remove character filters for individual searches
          page: page.toString(),
        };
        
        const results = await searchAO3Stories(singleFandomFilters);
        fandomStories.push(...results.stories);
        
        // Add small delay between requests to the same fandom
        if (page < pagesToFetchPerFandom) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Stop early if we don't get any results
        if (results.stories.length === 0) {
          break;
        }
      } catch (error) {
        console.error(`Error fetching page ${page} from fandom ${fandom}:`, error);
        break;
      }
    }
    
    console.log(`Collected ${fandomStories.length} stories from ${fandom}`);
    return fandomStories;
  });
  
  // Wait for all fandom fetches to complete
  const fandomResults = await Promise.all(fetchPromises);
  
  // Combine all stories
  fandomResults.forEach(stories => allStories.push(...stories));
  
  console.log(`Total collected: ${allStories.length} stories from ${fandomResults.length} fandoms`);
  
  return {
    stories: allStories,
    totalEstimate
  };
}

// Improved sequential search with proper pagination
async function sequentialMultiFandomSearch(filters: SearchFilters): Promise<{
  stories: AO3SearchResult[];
  totalPages: number;
  currentPage: number;
}> {
  const currentPage = parseInt(filters.page || '1');
  
  console.log(`Multi-fandom search for page ${currentPage} with proper pagination`);
  
  try {
    // Fetch enough stories to properly paginate
    const result = await fetchStoriesForPagination(filters, currentPage);
    
    // Apply relationship filtering to the fetched stories
    let filteredStories = result.stories;
    if (filters.characters && filters.characters.length > 0) {
      filteredStories = filterStoriesByRelationships(filteredStories, filters.characters);
      console.log(`Applied relationship filter: ${result.stories.length} -> ${filteredStories.length} stories`);
    }
    
    // Remove duplicates (in case there are cross-fandom stories)
    const uniqueStories = filteredStories.filter((story, index, self) => 
      index === self.findIndex(s => s.workId === story.workId)
    );
    
    // Sort by the specified sort column
    const sortColumn = filters.sort_column || 'revised_at';
    uniqueStories.sort((a, b) => {
      switch (sortColumn) {
        case 'revised_at':
        default:
          const dateA = new Date(a.lastUpdatedDate).getTime();
          const dateB = new Date(b.lastUpdatedDate).getTime();
          return dateB - dateA; // Most recent first
        case 'kudos_count':
          return b.kudos - a.kudos; // Most kudos first
        case 'hits':
          return b.hits - a.hits; // Most hits first
        case 'bookmarks_count':
          return b.bookmarks - a.bookmarks; // Most bookmarks first
        case 'comments_count':
          // AO3 doesn't provide comment count, fallback to kudos
          return b.kudos - a.kudos;
      }
    });
    
    // Calculate proper pagination
    const totalStories = uniqueStories.length;
    const storiesPerPage = 20;
    const startIndex = (currentPage - 1) * storiesPerPage;
    const endIndex = startIndex + storiesPerPage;
    const paginatedStories = uniqueStories.slice(startIndex, endIndex);
    
    // Estimate total pages - this is conservative since we may not have fetched all stories
    // But it gives a realistic pagination based on what we have
    const minTotalPages = Math.ceil(totalStories / storiesPerPage);
    const estimatedTotalPages = Math.max(minTotalPages, Math.ceil(result.totalEstimate * 0.1 / storiesPerPage)); // Conservative estimate
    
    console.log(`Page ${currentPage}: showing ${paginatedStories.length} stories from ${totalStories} sorted stories, estimated ${estimatedTotalPages} total pages`);
    console.log(`Sort order: ${sortColumn}, Pagination: ${startIndex}-${endIndex} of ${totalStories}`);
    
    return {
      stories: paginatedStories,
      totalPages: estimatedTotalPages,
      currentPage,
    };
  } catch (error) {
    console.error('Error in multi-fandom search:', error);
    
    // Fallback: return minimal results
    return {
      stories: [],
      totalPages: 1,
      currentPage: 1,
    };
  }
}

// Improved multi-fandom search using OR query approach
async function handleMultiFandomSearch(filters: SearchFilters): Promise<{
  stories: AO3SearchResult[];
  totalPages: number;
  currentPage: number;
}> {
  if (!Array.isArray(filters.fandom)) {
    throw new Error('Expected array of fandoms for multi-fandom search');
  }

  try {
    console.log(`Starting OR query multi-fandom search for: ${filters.fandom.join(', ')}`);
    
    // Build OR query for fandoms
    const fandomOrQuery = buildFandomOrQuery(filters.fandom, filters.query);
    
    // Create new filters using OR query instead of fandom tags
    const orQueryFilters: SearchFilters = {
      ...filters,
      query: fandomOrQuery,
      fandom: undefined, // Remove fandom filters when using query
      characters: undefined, // Remove character filters for multi-fandom search
    };
    
    console.log(`Multi-fandom OR query: ${fandomOrQuery}`);
    
    // Execute single search with OR query
    const results = await searchAO3Stories(orQueryFilters);
    
    console.log(`OR query returned ${results.stories.length} stories before filtering`);
    
    // Filter results to ensure they actually contain the requested fandoms
    // This helps remove false positives from query-based search
    let filteredStories = filterStoriesByFandom(results.stories, filters.fandom);
    
    console.log(`After fandom filtering: ${filteredStories.length} stories`);
    
    // Apply relationship filtering if specified
    if (filters.characters && filters.characters.length > 0) {
      filteredStories = filterStoriesByRelationships(filteredStories, filters.characters);
      console.log(`After relationship filtering: ${filteredStories.length} stories`);
    }
    
    // For multi-fandom searches, always prefer sequential search for better coverage
    // OR query often misses stories or returns inconsistent results
    if (filters.fandom.length > 1) {
      console.log('Multi-fandom search detected, using sequential search for comprehensive results');
      return await sequentialMultiFandomSearch(filters);
    }
    
    return {
      stories: filteredStories,
      totalPages: results.totalPages,
      currentPage: results.currentPage,
    };
    
  } catch (error) {
    console.warn('OR query multi-fandom search failed, falling back to sequential:', error);
    // Fallback to sequential approach if OR query fails
    return await sequentialMultiFandomSearch(filters);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse fandom parameter - support both single and multiple fandoms
    let fandom: string | string[] | undefined;
    const fandomParam = searchParams.get('fandom');
    const fandomsParam = searchParams.getAll('fandoms'); // Support multiple fandoms as separate parameters
    
    if (fandomsParam.length > 0) {
      // Use fandoms array if provided
      fandom = fandomsParam;
    } else if (fandomParam) {
      // Parse comma-separated fandoms or use single fandom
      const fandoms = fandomParam.split(',').map(f => f.trim()).filter(f => f);
      fandom = fandoms.length > 1 ? fandoms : fandomParam;
    }
    
    // Parse character parameter - support multiple characters as separate parameters
    const charactersParam = searchParams.getAll('characters');
    
    const filters: SearchFilters = {
      query: searchParams.get('query') || undefined,
      fandom,
      characters: charactersParam.length > 0 ? charactersParam : undefined,
      complete: searchParams.get('complete') as 'true' | 'false' | '' || '',
      words_from: searchParams.get('words_from') || undefined,
      words_to: searchParams.get('words_to') || undefined,
      kudos_from: searchParams.get('kudos_from') || undefined,
      sort_column: searchParams.get('sort_column') as SearchFilters['sort_column'] || 'revised_at',
      page: searchParams.get('page') || '1',
    };

    console.log('Search filters:', filters);
    
    // Handle multi-fandom searches
    if (Array.isArray(filters.fandom) && filters.fandom.length > 1) {
      const results = await handleMultiFandomSearch(filters);
      return NextResponse.json({
        success: true,
        data: results,
      });
    }
    
    const results = await searchAO3Stories(filters);
    
    return NextResponse.json({
      success: true,
      data: results,
    });

  } catch (error) {
    console.error('AO3 search error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}