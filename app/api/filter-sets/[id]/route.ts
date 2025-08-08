import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db/drizzle';
import { savedFilterSets } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// PUT - Update a filter set (name, description, pin status, or track usage)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, isPinned, incrementUsage, filters } = body;

    // Check if filter set exists and belongs to user
    const existingFilterSet = await db
      .select()
      .from(savedFilterSets)
      .where(and(eq(savedFilterSets.id, id), eq(savedFilterSets.userId, session.user.id)))
      .limit(1);

    if (existingFilterSet.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Filter set not found' },
        { status: 404 }
      );
    }

    const updateData: {
      updatedAt: Date;
      name?: string;
      description?: string | null;
      isPinned?: boolean;
      filters?: string;
      useCount?: number;
      lastUsed?: Date;
    } = {
      updatedAt: new Date(),
    };

    // Update fields if provided
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (filters !== undefined) updateData.filters = JSON.stringify(filters);

    // Handle usage tracking
    if (incrementUsage) {
      updateData.useCount = existingFilterSet[0].useCount + 1;
      updateData.lastUsed = new Date();
    }

    await db
      .update(savedFilterSets)
      .set(updateData)
      .where(and(eq(savedFilterSets.id, id), eq(savedFilterSets.userId, session.user.id)));

    return NextResponse.json({
      success: true,
      message: 'Filter set updated successfully',
    });

  } catch (error) {
    console.error('Error updating filter set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update filter set' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a filter set
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if filter set exists and belongs to user
    const existingFilterSet = await db
      .select()
      .from(savedFilterSets)
      .where(and(eq(savedFilterSets.id, id), eq(savedFilterSets.userId, session.user.id)))
      .limit(1);

    if (existingFilterSet.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Filter set not found' },
        { status: 404 }
      );
    }

    await db
      .delete(savedFilterSets)
      .where(and(eq(savedFilterSets.id, id), eq(savedFilterSets.userId, session.user.id)));

    return NextResponse.json({
      success: true,
      message: 'Filter set deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting filter set:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete filter set' },
      { status: 500 }
    );
  }
}