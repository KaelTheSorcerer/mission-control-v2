import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { TaskQueries, PlanningSessionQueries, initDatabase } from '@/lib/db';
import type { ApiResponse, PlanningSession, PlanningQuestion } from '@/types';

// Initialize database
initDatabase();

// Validation schemas
const startPlanningSchema = z.object({
  questions: z.array(z.object({
    id: z.string().optional(),
    question: z.string().min(1),
    type: z.enum(['text', 'choice', 'confirm']).default('text'),
    options: z.array(z.string()).optional(),
  })).min(1),
});

const submitAnswersSchema = z.object({
  answers: z.array(z.object({
    question_id: z.string(),
    answer: z.string(),
    answered_at: z.string().default(() => new Date().toISOString()),
  })).min(1),
});

/**
 * POST /api/tasks/[id]/planning - Start or update planning session
 * 
 * Body for starting: { questions: [...] }
 * Body for submitting answers: { answers: [...] }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if task exists
    const task = TaskQueries.getById(id);
    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Determine if this is starting planning or submitting answers
    if ('answers' in body) {
      return submitAnswers(id, body);
    } else {
      return startPlanning(id, body);
    }
  } catch (error) {
    console.error('Error in planning session:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to process planning session',
    };
    return NextResponse.json(response, { status: 500 });
  }
}

/**
 * Start a new planning session for a task
 */
async function startPlanning(taskId: string, body: unknown): Promise<NextResponse> {
  const validation = startPlanningSchema.safeParse(body);
  if (!validation.success) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Generate IDs for questions that don't have them
  const questions: PlanningQuestion[] = validation.data.questions.map(q => ({
    id: q.id || uuidv4(),
    question: q.question,
    type: q.type,
    options: q.options,
  }));

  // Create planning session
  const planningSession = PlanningSessionQueries.create({
    id: uuidv4(),
    taskId,
    questions,
  });

  // Link to task
  TaskQueries.linkPlanningSession(taskId, planningSession.id);

  const response: ApiResponse<PlanningSession> = {
    success: true,
    data: planningSession,
    message: 'Planning session started',
  };

  return NextResponse.json(response, { status: 201 });
}

/**
 * Submit answers for a planning session
 */
async function submitAnswers(taskId: string, body: unknown): Promise<NextResponse> {
  const validation = submitAnswersSchema.safeParse(body);
  if (!validation.success) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Invalid input: ' + validation.error.issues.map(e => e.message).join(', '),
    };
    return NextResponse.json(response, { status: 400 });
  }

  // Get the planning session for this task
  const planningSession = PlanningSessionQueries.getByTaskId(taskId);
  if (!planningSession) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'No active planning session found for this task',
    };
    return NextResponse.json(response, { status: 404 });
  }

  // Submit answers
  const updatedSession = PlanningSessionQueries.submitAnswers(
    planningSession.id,
    { answers: validation.data.answers }
  );

  if (!updatedSession) {
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to submit answers',
    };
    return NextResponse.json(response, { status: 500 });
  }

  // If planning is complete, update task status to ready
  if (updatedSession.completed) {
    TaskQueries.update(taskId, { status: 'ready' });
  }

  const response: ApiResponse<PlanningSession> = {
    success: true,
    data: updatedSession,
    message: updatedSession.completed ? 'Planning completed' : 'Answers submitted',
  };

  return NextResponse.json(response);
}

/**
 * GET /api/tasks/[id]/planning - Get planning session for a task
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Check if task exists
    const task = TaskQueries.getById(id);
    if (!task) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'Task not found',
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Get planning session
    const planningSession = PlanningSessionQueries.getByTaskId(id);
    if (!planningSession) {
      const response: ApiResponse<never> = {
        success: false,
        error: 'No planning session found for this task',
      };
      return NextResponse.json(response, { status: 404 });
    }

    const response: ApiResponse<PlanningSession> = {
      success: true,
      data: planningSession,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching planning session:', error);
    const response: ApiResponse<never> = {
      success: false,
      error: 'Failed to fetch planning session',
    };
    return NextResponse.json(response, { status: 500 });
  }
}
