import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TaskQueries, AgentQueries, initDatabase } from '@/lib/db';
import { rateLimit } from '@/lib/rateLimit';
import type { ApiResponse, Task, UpdateTaskInput } from '@/types';

// Initialize database
initDatabase();

// Validation schemas
const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'planning', 'ready', 'dispatched', 'in_progress', 'completed', 'failed', 'cancelled']).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  agent_id: z.string().nullable().optional(),
  deliverables: z.array(z.object({
    id: z.string(),
    description: z.string(),
    completed: z.boolean(),
    completedAt: z.string().optional(),
  })).optional(),
});

/**
 * GET /api/tasks/[id] - Get a single task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const limited = rateLimit(request, { windowMs: 60_000, max: 120, keyPrefix: 'task-get' });
    if (limited) return limited;

    const { id } = await params;
    const task = TaskQueries.getById(id);

    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * PATCH /api/tasks/[id] - Update a task
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const limited = rateLimit(request, { windowMs: 60_000, max: 30, keyPrefix: 'task-patch' });
    if (limited) return limited;

    const { id } = await params;
    const body = await request.json();

    // Check if task exists
    const existingTask = TaskQueries.getById(id);
    if (!existingTask) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Validate input
    const validation = updateTaskSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const input: UpdateTaskInput = validation.data;
    
    // Handle status change with timestamps
    if (input.status && input.status !== existingTask.status) {
      TaskQueries.updateStatus(id, input.status);
    }
    
    const task = TaskQueries.update(id, input);

    const response: ApiResponse<Task> = {
      success: true,
      data: task!,
      message: 'Task updated successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error updating task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to update task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id] - Delete a task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const limited = rateLimit(request, { windowMs: 60_000, max: 15, keyPrefix: 'task-delete' });
    if (limited) return limited;

    const { id } = await params;
    
    // Check if task exists
    const existingTask = TaskQueries.getById(id);
    if (!existingTask) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Clear agent's current task if assigned
    if (existingTask.agent_id) {
      AgentQueries.clearTask(existingTask.agent_id);
    }

    const deleted = TaskQueries.delete(id);

    if (!deleted) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to delete task',
      };
      return NextResponse.json(response, { status: 500 });
    }

    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id },
      message: 'Task deleted successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error deleting task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to delete task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
