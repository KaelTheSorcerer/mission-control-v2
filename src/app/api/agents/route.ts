import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { AgentQueries, initDatabase } from '@/lib/db';
import type { ApiResponse, AgentListResponse, CreateAgentInput, Agent } from '@/types';

// Initialize database
initDatabase();

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  role: z.string().min(1).max(255),
});

/**
 * GET /api/agents - List all agents
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    let agents = AgentQueries.getAll();
    
    // Filter by status if provided
    if (status) {
      agents = agents.filter(a => a.status === status);
    }

    const response: ApiResponse<AgentListResponse> = {
      success: true,
      data: {
        agents,
        total: agents.length,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching agents:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch agents',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * POST /api/agents - Create a new agent
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = createAgentSchema.safeParse(body);
    if (!validation.success) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const input: CreateAgentInput = validation.data;
    const agent = AgentQueries.create({
      ...input,
      id: uuidv4(),
    });

    const response: ApiResponse<Agent> = {
      success: true,
      data: agent,
      message: 'Agent created successfully',
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to create agent',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
