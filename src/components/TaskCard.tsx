'use client';

import { Task } from '@/lib/types';
import { getPriorityLabel, getPriorityColor } from '@/lib/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Agent } from '@/lib/api';

interface TaskCardProps {
  task: Task;
  agent?: Agent;
  onClick?: () => void;
}

export function TaskCard({ task, agent, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priorityLabel = getPriorityLabel(task.priority);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-slate-200 p-3 cursor-grab',
        'hover:shadow-md transition-shadow',
        'active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white',
            priorityColor
          )}
        >
          {priorityLabel}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 text-sm mb-1 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
          {task.description}
        </p>
      )}

      {/* Footer: Agent */}
      {agent && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              agent.status === 'idle' && 'bg-green-500',
              agent.status === 'busy' && 'bg-yellow-500',
              agent.status === 'offline' && 'bg-slate-400',
              agent.status === 'error' && 'bg-red-500'
            )}
          />
          <span className="text-xs text-slate-600 truncate">{agent.name}</span>
        </div>
      )}
    </div>
  );
}
