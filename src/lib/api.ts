// Mission Control API Client
// Use relative URL to work with any host (local, tunnel, or deployed)
const API_BASE = '/api';

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

export type TaskStatus = 
  | 'pending' 
  | 'planning' 
  | 'ready' 
  | 'dispatched' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
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

export type AgentStatus = 'idle' | 'busy' | 'offline' | 'error';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Column mapping for UI
export const COLUMN_MAP: Record<string, { id: TaskStatus; title: string; color: string }> = {
  PLANNING: { id: 'planning', title: 'Planning', color: 'bg-blue-500' },
  READY: { id: 'ready', title: 'Ready', color: 'bg-slate-500' },
  IN_PROGRESS: { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
  REVIEW: { id: 'in_progress', title: 'Review', color: 'bg-purple-500' },
  TESTING: { id: 'in_progress', title: 'Testing', color: 'bg-orange-500' },
  DEPLOYMENT: { id: 'dispatched', title: 'Deployment', color: 'bg-cyan-500' },
  DONE: { id: 'completed', title: 'Done', color: 'bg-green-500' },
};

export const COLUMNS = [
  { id: 'planning', title: 'Planning', color: 'bg-blue-500' },
  { id: 'ready', title: 'Ready', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'dispatched', title: 'Dispatched', color: 'bg-cyan-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
  { id: 'failed', title: 'Failed', color: 'bg-red-500' },
];

// Task API
export async function getTasks(): Promise<Task[]> {
  const res = await fetch(`${API_BASE}/tasks`);
  const json: ApiResponse<{ tasks: Task[] }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data?.tasks || [];
}

export async function createTask(data: { title: string; description?: string; priority?: number }): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Task> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Task> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}

export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete task');
}

// Agent API
export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${API_BASE}/agents`);
  const json: ApiResponse<{ agents: Agent[] }> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data?.agents || [];
}

export async function createAgent(data: { name: string; role: string }): Promise<Agent> {
  const res = await fetch(`${API_BASE}/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json: ApiResponse<Agent> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!;
}
