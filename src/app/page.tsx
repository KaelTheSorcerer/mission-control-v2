'use client';

import { useState, useEffect } from 'react';
import { Task, TaskStatus, Document, COLUMNS } from '@/lib/types';
import { Agent, getTasks, getAgents, createTask, updateTask, deleteTask } from '@/lib/api';
import { KanbanBoard } from '@/components/KanbanBoard';
import { TaskModal } from '@/components/TaskModal';
import { AgentCard } from '@/components/AgentCard';
import { PlanningDialog } from '@/components/PlanningDialog';
import { DocumentPanel } from '@/components/DocumentPanel';
import {
  Plus,
  Bot,
  FolderOpen,
  Layout,
  Users,
  Sparkles,
  Github,
  Settings,
  Bell,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    taskId: 'task-1',
    name: 'API Specification.md',
    type: 'doc',
    url: '#',
    createdAt: new Date(),
  },
  {
    id: 'doc-2',
    taskId: 'task-2',
    name: 'ComponentLibrary.tsx',
    type: 'code',
    url: '#',
    createdAt: new Date(),
  },
];

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [documents] = useState<Document[]>(mockDocuments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('planning');

  const [isPlanningOpen, setIsPlanningOpen] = useState(false);
  const [isDocumentPanelOpen, setIsDocumentPanelOpen] = useState(false);

  // Load data on mount and auto-refresh every 15 minutes
  useEffect(() => {
    loadData();
    
    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      loadData();
    }, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, agentsData] = await Promise.all([
        getTasks(),
        getAgents(),
      ]);
      setTasks(tasksData);
      setAgents(agentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const updated = await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? updated : t))
      );
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleAddTask = (status: TaskStatus) => {
    setSelectedTask(null);
    setNewTaskStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        // Update existing task
        const updated = await updateTask(selectedTask.id, taskData);
        setTasks((prev) =>
          prev.map((t) => (t.id === selectedTask.id ? updated : t))
        );
      } else {
        // Create new task
        const created = await createTask({
          title: taskData.title || 'New Task',
          description: taskData.description || undefined,
          priority: taskData.priority || 5,
        });
        // Set initial status if different from default
        if (newTaskStatus !== 'pending') {
          await updateTask(created.id, { status: newTaskStatus });
          const updated = await getTasks();
          setTasks(updated);
        } else {
          setTasks((prev) => [...prev, created]);
        }
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      setError('Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
    }
  };

  const getCurrentTaskTitle = (agent: Agent) => {
    if (!agent.current_task_id) return undefined;
    return tasks.find((t) => t.id === agent.current_task_id)?.title;
  };

  const taskCounts = {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Mission Control</h1>
              <p className="text-xs text-slate-500">Project Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Stats */}
            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Total:</span>
                <span className="font-semibold text-slate-900">{taskCounts.total}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500">In Progress:</span>
                <span className="font-semibold text-blue-600">{taskCounts.inProgress}</span>
              </div>
              <div className="w-px h-4 bg-slate-300" />
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Done:</span>
                <span className="font-semibold text-green-600">{taskCounts.completed}</span>
              </div>
            </div>

            <div className="w-px h-6 bg-slate-200" />

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              </button>

              <button
                onClick={() => setIsPlanningOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI Planning
              </button>

              <button
                onClick={() => setIsDocumentPanelOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Files
              </button>

              <button
                onClick={() => handleAddTask('planning')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>

              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>

              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] p-4">
          <div className="space-y-6">
            {/* Agents Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Active Agents</h2>
                <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {agents.length}
                </span>
              </div>

              <div className="space-y-3">
                {agents.map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    currentTaskTitle={getCurrentTaskTitle(agent)}
                  />
                ))}
                {agents.length === 0 && !loading && (
                  <p className="text-sm text-slate-400 text-center py-4">No agents yet</p>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Quick Links</h3>
              <div className="space-y-1">
                <a
                  href="https://github.com/KaelTheSorcerer/mission-control"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Github className="w-4 h-4" />
                  Repository
                </a>
                <a
                  href="https://www.notion.so/OpenClaw-Workspace-2ff73065b8588008bf16d334766443a2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Layout className="w-4 h-4" />
                  Notion Workspace
                </a>
                <button
                  onClick={() => handleAddTask('planning')}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors w-full text-left"
                >
                  <Users className="w-4 h-4" />
                  New Task
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Kanban Board</h2>
              <p className="text-sm text-slate-500">Drag and drop tasks to update their status</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Loading...
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard
                  tasks={tasks}
                  agents={agents}
                  onTaskMove={handleTaskMove}
                  onTaskClick={handleTaskClick}
                  onAddTask={handleAddTask}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        task={selectedTask}
        agents={agents}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={selectedTask ? handleDeleteTask : undefined}
        initialStatus={newTaskStatus}
      />

      <PlanningDialog
        isOpen={isPlanningOpen}
        onClose={() => setIsPlanningOpen(false)}
        onGenerateTasks={(description) => {
          console.log('Generate tasks from:', description);
        }}
      />

      <DocumentPanel
        documents={documents}
        tasks={tasks}
        isOpen={isDocumentPanelOpen}
        onClose={() => setIsDocumentPanelOpen(false)}
      />
    </div>
  );
}
