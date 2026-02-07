import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AgentQueries, TaskQueries, SessionQueries, initDatabase } from '@/lib/db';
import type { ApiResponse, Agent, Task } from '@/types';

// Initialize database
initDatabase();

// Validation schemas
const assignSchema = z.object({
  task_id: z.string().optional(),
  release: z.boolean().default(false),
});

/**
 * POST /api/agents/[id]/assign - Assign task to agent or release agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = assignSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { task_id, release } = validation.data;

    // Check if agent exists
    const agent = AgentQueries.getById(id);
    if (!agent) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Agent not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Handle release request
    if (release) {
      if (agent.status === 'idle') {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Agent is already idle',
        };
        return NextResponse.json(response, { status: 400 });
      }

      // Clear current task from agent
      if (agent.current_task_id) {
        // Update task status if it was in progress
        const task = TaskQueries.getById(agent.current_task_id);
        if (task && (task.status === 'in_progress' || task.status === 'dispatched')) {
          TaskQueries.update(agent.current_task_id, { 
            status: 'pending',
            agent_id: null,
          });
        }
      }

      // Cancel any active sessions
      const sessions = SessionQueries.getByAgentId(id);
      for (const session of sessions) {
        if (session.status === 'active') {
          SessionQueries.cancel(session.id);
        }
      }

      AgentQueries.clearTask(id);

      const response: ApiResponse<{ agent: Agent; released: true }> = {
        success: true,
        data: {
          agent: AgentQueries.getById(id)!,
          released: true,
        },
        message: 'Agent released from current task',
      };

      return NextResponse.json(response);
    }

    // Handle assignment
    if (!task_id) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'task_id is required when not releasing',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if agent is available
    if (agent.status !== 'idle') {
      const response: ApiResponse<never> = {
        success: false,
        error: `Agent is ${agent.status}, not available for assignment`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if task exists
    const task = TaskQueries.getById(task_id);
    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if task is available for assignment
    if (task.status !== 'pending' && task.status !== 'ready' && task.status !== 'planning') {
      const response: ApiResponse<never> = {
        success: false,
        error: `Task is ${task.status}, cannot be assigned`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Assign task to agent
    AgentQueries.assignTask(id, task_id);
    TaskQueries.update(task_id, {
      status: 'dispatched',
      agent_id: id,
    });

    const response: ApiResponse<{ agent: Agent; task: Task }> = {
      success: true,
      data: {
        agent: AgentQueries.getById(id)!,
        task: TaskQueries.getById(task_id)!,
      },
      message: 'Task assigned to agent successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error assigning task to agent:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to assign task to agent',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
