import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { TaskQueries, initDatabase } from '@/lib/db';
import type { ApiResponse, TaskListResponse, CreateTaskInput, Task } from '@/types';

// Initialize database on first load
initDatabase();

// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.number().int().min(1).max(10).optional(),
});

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
 * GET /api/tasks - List all tasks
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const agent_id = searchParams.get('agent_id') || undefined;
    const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority')!) : undefined;

    const tasks = TaskQueries.getAll({ status, agent_id, priority });
    
    const response: ApiResponse<TaskListResponse> = {
      success: true,
      data: {
        tasks,
        total: tasks.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch tasks',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/tasks - Create a new task
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const input: CreateTaskInput = validation.data;
    const task = TaskQueries.create({
      ...input,
      id: uuidv4(),
    });

    const response: ApiResponse<Task> = {
      success: true,
      data: task,
      message: 'Task created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
