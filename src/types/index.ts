// Mission Control v2.0 Type Definitions

export type TaskStatus = 
  | 'pending' 
  | 'planning' 
  | 'ready' 
  | 'dispatched' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type AgentStatus = 'idle' | 'busy' | 'offline' | 'error';

export type SessionStatus = 'active' | 'completed' | 'failed' | 'cancelled';

export interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: number;
  agent_id: string | null;
  deliverables: Deliverable[];
  planning_session_id: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: number;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: number;
  agent_id?: string | null;
  deliverables?: Deliverable[];
  planning_session_id?: string | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  current_task_id: string | null;
  session_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentInput {
  name: string;
  role: string;
}

export interface UpdateAgentInput {
  name?: string;
  role?: string;
  status?: AgentStatus;
  current_task_id?: string | null;
  session_key?: string | null;
}

export interface PlanningSession {
  id: string;
  task_id: string;
  questions: PlanningQuestion[];
  answers: PlanningAnswer[];
  completed: boolean;
  created_at: string;
  completed_at: string | null;
}

export interface PlanningQuestion {
  id: string;
  question: string;
  type: 'text' | 'choice' | 'confirm';
  options?: string[];
}

export interface PlanningAnswer {
  question_id: string;
  answer: string;
  answered_at: string;
}

export interface CreatePlanningSessionInput {
  questions: PlanningQuestion[];
}

export interface SubmitPlanningAnswersInput {
  answers: PlanningAnswer[];
}

export interface Session {
  id: string;
  agent_id: string;
  task_id: string;
  status: SessionStatus;
  output: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CreateSessionInput {
  agent_id: string;
  task_id: string;
}

// OpenClaw Gateway Types
export interface OpenClawSpawnCommand {
  type: 'spawn';
  agent: string;
  task: string;
  sessionId: string;
  config?: Record<string, unknown>;
}

export interface OpenClawStatusUpdate {
  type: 'status';
  sessionId: string;
  status: AgentStatus;
  output?: string;
  error?: string;
}

export interface OpenClawMessage {
  type: 'spawn' | 'status' | 'ping' | 'pong' | 'error';
  payload?: unknown;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
}
