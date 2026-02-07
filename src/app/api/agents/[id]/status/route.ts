import { NextRequest, NextResponse } from 'next/server';
import { AgentQueries, initDatabase } from '@/lib/db';
import type { ApiResponse, Agent } from '@/types';

// Initialize database
initDatabase();

/**
 * GET /api/agents/[id]/status - Get agent status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const agent = AgentQueries.getById(id);

    if (!agent) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Agent not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Return simplified status info
    const statusInfo = {
      id: agent.id,
      name: agent.name,
      status: agent.status,
      role: agent.role,
      current_task_id: agent.current_task_id,
      updated_at: agent.updated_at,
    };

    const response: ApiResponse<typeof statusInfo> = {
      success: true,
      data: statusInfo,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching agent status:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch agent status',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
