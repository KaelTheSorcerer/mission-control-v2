'use client';

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Task, TaskStatus, COLUMNS } from '@/lib/types';
import { Agent } from '@/lib/api';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  agents: Agent[];
  onTaskMove: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

export function KanbanBoard({
  tasks,
  agents,
  onTaskMove,
  onTaskClick,
  onAddTask,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const tasksByColumn = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      pending: [],
      planning: [],
      ready: [],
      dispatched: [],
      in_progress: [],
      completed: [],
      failed: [],
      cancelled: [],
    };

    tasks.forEach((task) => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    // Sort by priority (highest first)
    Object.keys(grouped).forEach((key) => {
      grouped[key as TaskStatus].sort((a, b) => b.priority - a.priority);
    });

    return grouped;
  }, [tasks]);

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeId),
    [activeId, tasks]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    
    // Check if dropped over a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column && activeTask.status !== column.id) {
      onTaskMove(activeTask.id, column.id);
      return;
    }

    // Check if dropped over a task in another column
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== activeTask.status) {
      onTaskMove(activeTask.id, overTask.status);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTask = tasks.find((t) => t.id === active.id);
    if (!activeTask) {
      setActiveId(null);
      return;
    }

    const overId = over.id as string;
    
    // Check if dropped over a column
    const column = COLUMNS.find((c) => c.id === overId);
    if (column) {
      onTaskMove(activeTask.id, column.id);
      setActiveId(null);
      return;
    }

    // Check if dropped over another task
    const overTask = tasks.find((t) => t.id === overId);
    if (overTask && overTask.status !== activeTask.status) {
      onTaskMove(activeTask.id, overTask.status);
    }

    setActiveId(null);
  };

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  const getAgent = (agentId?: string | null) => agents.find((a) => a.id === agentId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {COLUMNS.map((column) => {
          const columnTasks = tasksByColumn[column.id];

          return (
            <div
              key={column.id}
              id={column.id}
              className="flex-shrink-0 w-72 flex flex-col bg-slate-50 rounded-xl border border-slate-200"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div
                    className={cn('w-3 h-3 rounded-full', column.color)}
                  />
                  <span className="font-semibold text-slate-700">
                    {column.title}
                  </span>
                  <span className="bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => onAddTask(column.id)}
                  className="p-1 hover:bg-slate-200 rounded transition-colors"
                >
                  <Plus className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Column Content */}
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex-1 p-3 space-y-3 min-h-[150px]">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      agent={getAgent(task.agent_id)}
                      onClick={() => onTaskClick(task)}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            agent={getAgent(activeTask.agent_id)}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
