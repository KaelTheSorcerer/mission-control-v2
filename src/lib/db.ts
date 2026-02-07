// Simple JSON-based database for quick start
// Will be replaced with SQLite once bindings work

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import type {
  Task,
  Agent,
  Session,
  PlanningSession,
  CreateTaskInput,
  UpdateTaskInput,
  CreateAgentInput,
  UpdateAgentInput,
  CreatePlanningSessionInput,
  SubmitPlanningAnswersInput,
  CreateSessionInput,
} from '@/types';

// Use absolute path to ensure consistency across API routes and dev server
const DB_DIR = '/home/nvq2309/clawd/mission-control-v2/my-app/database';
const DB_FILE = join(DB_DIR, 'data.json');

interface Database {
  tasks: Task[];
  agents: Agent[];
  sessions: Session[];
  planningSessions: PlanningSession[];
}

let db: Database | null = null;

function initDb(): Database {
  if (db) return db;
  
  if (!existsSync(DB_DIR)) {
    mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (existsSync(DB_FILE)) {
    try {
      const data = readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
      return db!;
    } catch {
      // Fall through to create new
    }
  }
  
  db = {
    tasks: [],
    agents: [],
    sessions: [],
    planningSessions: [],
  };
  saveDb();
  return db;
}

function saveDb() {
  if (db) {
    writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
  }
}

function getDb(): Database {
  if (!db) return initDb();
  return db;
}

export function initDatabase(): Database {
  return initDb();
}

// ============================================
// TASK QUERIES
// ============================================

export const TaskQueries = {
  getAll(filters?: { status?: string; agent_id?: string; priority?: number }): Task[] {
    const database = getDb();
    let tasks = database.tasks;
    
    if (filters?.status) {
      tasks = tasks.filter(t => t.status === filters.status);
    }
    if (filters?.agent_id) {
      tasks = tasks.filter(t => t.agent_id === filters.agent_id);
    }
    if (filters?.priority !== undefined) {
      tasks = tasks.filter(t => t.priority === filters.priority);
    }
    
    return tasks.sort((a, b) => b.priority - a.priority);
  },

  getById(id: string): Task | null {
    const database = getDb();
    return database.tasks.find(t => t.id === id) || null;
  },

  create(input: CreateTaskInput & { id: string }): Task {
    const database = getDb();
    const task: Task = {
      id: input.id,
      title: input.title,
      description: input.description || null,
      status: 'pending',
      priority: input.priority || 5,
      agent_id: null,
      deliverables: [],
      planning_session_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      started_at: null,
      completed_at: null,
    };
    database.tasks.push(task);
    saveDb();
    return task;
  },

  update(id: string, input: UpdateTaskInput): Task | null {
    const database = getDb();
    const idx = database.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    
    const task = database.tasks[idx];
    database.tasks[idx] = {
      ...task,
      title: input.title ?? task.title,
      description: input.description !== undefined ? input.description : task.description,
      status: input.status ?? task.status,
      priority: input.priority ?? task.priority,
      agent_id: input.agent_id !== undefined ? input.agent_id : task.agent_id,
      deliverables: input.deliverables ?? task.deliverables,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    return database.tasks[idx];
  },

  delete(id: string): boolean {
    const database = getDb();
    const idx = database.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    database.tasks.splice(idx, 1);
    saveDb();
    return true;
  },

  linkPlanningSession(taskId: string, planningSessionId: string): boolean {
    return !!this.update(taskId, { planning_session_id: planningSessionId, status: 'planning' });
  },

  updateStatus(id: string, status: string): Task | null {
    const updates: Partial<Task> = { status: status as Task['status'] };
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString();
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
    return this.update(id, updates);
  },
};

// ============================================
// AGENT QUERIES
// ============================================

export const AgentQueries = {
  getAll(): Agent[] {
    return getDb().agents;
  },

  getById(id: string): Agent | null {
    return getDb().agents.find(a => a.id === id) || null;
  },

  create(input: CreateAgentInput & { id: string }): Agent {
    const database = getDb();
    const agent: Agent = {
      id: input.id,
      name: input.name,
      role: input.role,
      status: 'idle',
      current_task_id: null,
      session_key: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    database.agents.push(agent);
    saveDb();
    return agent;
  },

  update(id: string, input: UpdateAgentInput): Agent | null {
    const database = getDb();
    const idx = database.agents.findIndex(a => a.id === id);
    if (idx === -1) return null;
    
    const agent = database.agents[idx];
    database.agents[idx] = {
      ...agent,
      name: input.name ?? agent.name,
      role: input.role ?? agent.role,
      status: input.status ?? agent.status,
      current_task_id: input.current_task_id !== undefined ? input.current_task_id : agent.current_task_id,
      session_key: input.session_key !== undefined ? input.session_key : agent.session_key,
      updated_at: new Date().toISOString(),
    };
    saveDb();
    return database.agents[idx];
  },

  getIdle(): Agent[] {
    return getDb().agents.filter(a => a.status === 'idle');
  },

  assignTask(agentId: string, taskId: string): boolean {
    return !!this.update(agentId, { status: 'busy', current_task_id: taskId });
  },

  clearTask(agentId: string): boolean {
    return !!this.update(agentId, { status: 'idle', current_task_id: null });
  },
};

// ============================================
// PLANNING SESSION QUERIES
// ============================================

export const PlanningSessionQueries = {
  getAll(): PlanningSession[] {
    return getDb().planningSessions;
  },

  getById(id: string): PlanningSession | null {
    return getDb().planningSessions.find(p => p.id === id) || null;
  },

  getByTaskId(taskId: string): PlanningSession | null {
    return getDb().planningSessions.find(p => p.task_id === taskId) || null;
  },

  create(input: CreatePlanningSessionInput & { id: string; taskId: string }): PlanningSession {
    const database = getDb();
    const session: PlanningSession = {
      id: input.id,
      task_id: input.taskId,
      questions: input.questions,
      answers: [],
      completed: false,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    database.planningSessions.push(session);
    saveDb();
    return session;
  },

  submitAnswers(id: string, input: SubmitPlanningAnswersInput): PlanningSession | null {
    const database = getDb();
    const idx = database.planningSessions.findIndex(p => p.id === id);
    if (idx === -1) return null;
    
    const session = database.planningSessions[idx];
    const updatedAnswers = [...session.answers, ...input.answers];
    const allAnswered = updatedAnswers.length >= session.questions.length;
    
    database.planningSessions[idx] = {
      ...session,
      answers: updatedAnswers,
      completed: allAnswered,
      completed_at: allAnswered ? new Date().toISOString() : null,
    };
    saveDb();
    return database.planningSessions[idx];
  },

  delete(id: string): boolean {
    const database = getDb();
    const idx = database.planningSessions.findIndex(p => p.id === id);
    if (idx === -1) return false;
    database.planningSessions.splice(idx, 1);
    saveDb();
    return true;
  },
};

// ============================================
// SESSION QUERIES
// ============================================

export const SessionQueries = {
  getAll(): Session[] {
    return getDb().sessions;
  },

  getById(id: string): Session | null {
    return getDb().sessions.find(s => s.id === id) || null;
  },

  getByAgentId(agentId: string): Session[] {
    return getDb().sessions.filter(s => s.agent_id === agentId);
  },

  getByTaskId(taskId: string): Session[] {
    return getDb().sessions.filter(s => s.task_id === taskId);
  },

  create(input: CreateSessionInput & { id: string }): Session {
    const database = getDb();
    const session: Session = {
      id: input.id,
      agent_id: input.agent_id,
      task_id: input.task_id,
      status: 'active',
      output: null,
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      completed_at: null,
    };
    database.sessions.push(session);
    saveDb();
    return session;
  },

  appendOutput(id: string, output: string): boolean {
    const database = getDb();
    const idx = database.sessions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    database.sessions[idx].output = (database.sessions[idx].output || '') + output;
    database.sessions[idx].updated_at = new Date().toISOString();
    saveDb();
    return true;
  },

  updateStatus(id: string, status: string): boolean {
    const database = getDb();
    const idx = database.sessions.findIndex(s => s.id === id);
    if (idx === -1) return false;
    database.sessions[idx].status = status as Session['status'];
    database.sessions[idx].updated_at = new Date().toISOString();
    saveDb();
    return true;
  },

  complete(id: string, errorMessage?: string): Session | null {
    const database = getDb();
    const idx = database.sessions.findIndex(s => s.id === id);
    if (idx === -1) return null;
    database.sessions[idx].status = errorMessage ? 'failed' : 'completed';
    database.sessions[idx].error_message = errorMessage || null;
    database.sessions[idx].completed_at = new Date().toISOString();
    database.sessions[idx].updated_at = new Date().toISOString();
    saveDb();
    return database.sessions[idx];
  },

  cancel(id: string): Session | null {
    return this.complete(id, 'cancelled');
  },
};

export function closeDatabase(): void {
  db = null;
}
