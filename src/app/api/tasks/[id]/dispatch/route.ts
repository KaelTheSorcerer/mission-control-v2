import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { TaskQueries, AgentQueries, SessionQueries, initDatabase } from '@/lib/db';
import { getOpenClawClient } from '@/lib/openclaw';
import type { ApiResponse, Task, Session } from '@/types';

// Initialize database
initDatabase();

// Validation schema
const dispatchSchema = z.object({
  agent_id: z.string().optional(),
  auto_assign: z.boolean().default(true),
  agent_config: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/tasks/[id]/dispatch - Dispatch task to an agent
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = dispatchSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { agent_id, auto_assign, agent_config } = validation.data;

    // Check if task exists
    const task = TaskQueries.getById(id);
    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if task can be dispatched
    if (task.status === 'dispatched' || task.status === 'in_progress') {
      const response: ApiResponse<never> = {
        success: false,
        error: `Task is already ${task.status}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (task.status === 'completed' || task.status === 'failed' || task.status === 'cancelled') {
      const response: ApiResponse<never> = {
        success: false,
        error: `Task has already been ${task.status}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Determine which agent to use
    let targetAgentId = agent_id;
    
    if (!targetAgentId && auto_assign) {
      // Find an idle agent
      const idleAgents = AgentQueries.getIdle();
      if (idleAgents.length === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'No idle agents available for assignment',
        };
        return NextResponse.json(response, { status: 503 });
      }
      targetAgentId = idleAgents[0].id;
    }

    if (!targetAgentId) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'No agent specified and auto-assign is disabled',
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Verify agent exists
    const agent = AgentQueries.getById(targetAgentId);
    if (!agent) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Specified agent not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Check if agent is available
    if (agent.status !== 'idle') {
      const response: ApiResponse<never> = {
        success: false,
        error: `Agent is ${agent.status}, not available for assignment`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Create a new session
    const sessionId = uuidv4();
    const session = SessionQueries.create({
      id: sessionId,
      agent_id: targetAgentId,
      task_id: id,
    });

    // Assign task to agent
    AgentQueries.assignTask(targetAgentId, id);

    // Update task status
    TaskQueries.update(id, {
      status: 'dispatched',
      agent_id: targetAgentId,
    });

    // Try to spawn agent via OpenClaw Gateway
    const openclaw = getOpenClawClient();
    let spawned = false;
    
    if (openclaw.isConnected) {
      try {
        spawned = await openclaw.spawnAgent({
          agent: agent.name,
          task: `${task.title}: ${task.description || ''}`,
          sessionId,
          config: agent_config,
        });
      } catch (err) {
        console.error('Failed to spawn agent via OpenClaw:', err);
        // Continue anyway - agent might be spawned manually
      }
    }

    // Update task to in_progress if spawn was successful
    if (spawned) {
      TaskQueries.updateStatus(id, 'in_progress');
      SessionQueries.updateStatus?.(sessionId, 'in_progress');
    }

    const response: ApiResponse<{ task: Task; session: Session; spawned: boolean }> = {
      success: true,
      data: {
        task: TaskQueries.getById(id)!,
        session: SessionQueries.getById(sessionId)!,
        spawned,
      },
      message: spawned 
        ? 'Task dispatched and agent spawned successfully' 
        : 'Task dispatched. Agent spawn queued - will retry when gateway is available.',
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error dispatching task:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to dispatch task',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
