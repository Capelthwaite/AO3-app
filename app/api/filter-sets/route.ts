import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { savedFilterSets } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface SavedFilterSet {
  id: string;
  name: string;
  description?: string;
  filters: {
    query: string;
    fandoms: string[];
    complete: string;
    words_from: string;
    words_to: string;
    kudos_from: string;
    sort_column: string;
  };
  isPinned: boolean;
  useCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// GET - List user's saved filter sets
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const filterSets = await db
      .select()
      .from(savedFilterSets)
      .where(eq(savedFilterSets.userId, session.user.id))
      .orderBy(desc(savedFilterSets.isPinned), desc(savedFilterSets.lastUsed), desc(savedFilterSets.createdAt));

    const formattedFilterSets: SavedFilterSet[] = filterSets.map(fs => ({
      id: fs.id,
      name: fs.name,
      description: fs.description || undefined,
      filters: JSON.parse(fs.filters),
      isPinned: fs.isPinned,
      useCount: fs.useCount,
      lastUsed: fs.lastUsed,
      createdAt: fs.createdAt,
      updatedAt: fs.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedFilterSets,
    });

  } catch (error) {
    console.error('Error fetching filter sets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch filter sets' },
      { status: 500 }
    );
  }
}

// POST - Create a new saved filter set
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, filters, isPinned = false } = await request.json();

    if (!name || !filters) {
      return NextResponse.json(
        { success: false, error: 'Name and filters are required' },
        { status: 400 }
      );
    }

    // Validate filters structure
    const requiredFields = ['query', 'fandoms', 'complete', 'words_from', 'words_to', 'kudos_from', 'sort_column'];
    const hasAllFields = requiredFields.every(field => field in filters);
    
    if (!hasAllFields) {
      return NextResponse.json(
        { success: false, error: 'Invalid filters structure' },
        { status: 400 }
      );
    }

    const filterSetId = nanoid();
    const now = new Date();

    await db.insert(savedFilterSets).values({
      id: filterSetId,
      userId: session.user.id,
      name,
      description: description || null,
      filters: JSON.stringify(filters),
      isPinned,
      useCount: 0,
      lastUsed: null,
      createdAt: now,
      updatedAt: now,
    });

    const newFilterSet: SavedFilterSet = {
      id: filterSetId,
      name,
      description,
      filters,
      isPinned,
      useCount: 0,
      lastUsed: null,
      createdAt: now,
      updatedAt: now,
    };

    return NextResponse.json({
      success: true,
      data: newFilterSet,
    });

  } catch (error) {
    console.error('Error creating filter set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create filter set' },
      { status: 500 }
    );
  }
}