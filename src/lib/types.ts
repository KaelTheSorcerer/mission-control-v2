// Types aligned with backend API
export type TaskStatus = 
  | 'pending' 
  | 'planning' 
  | 'ready' 
  | 'dispatched' 
  | 'in_progress' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type TaskPriority = number; // 1-10

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

export interface Deliverable {
  id: string;
  description: string;
  completed: boolean;
  completedAt?: string;
}

export type AgentStatus = 'idle' | 'busy' | 'offline' | 'error';

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

export interface Document {
  id: string;
  taskId: string;
  name: string;
  type: 'code' | 'doc' | 'image' | 'other';
  url: string;
  createdAt: Date;
}

export const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'planning', title: 'Planning', color: 'bg-blue-500' },
  { id: 'ready', title: 'Ready', color: 'bg-slate-500' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-500' },
  { id: 'dispatched', title: 'Dispatched', color: 'bg-cyan-500' },
  { id: 'completed', title: 'Completed', color: 'bg-green-500' },
  { id: 'failed', title: 'Failed', color: 'bg-red-500' },
];

// Helper to convert number priority to display label
export function getPriorityLabel(priority: number): string {
  if (priority >= 9) return 'URGENT';
  if (priority >= 7) return 'HIGH';
  if (priority >= 4) return 'MEDIUM';
  return 'LOW';
}

// Helper to get color for priority
export function getPriorityColor(priority: number): string {
  if (priority >= 9) return 'bg-red-500';
  if (priority >= 7) return 'bg-orange-500';
  if (priority >= 4) return 'bg-yellow-500';
  return 'bg-slate-500';
}
