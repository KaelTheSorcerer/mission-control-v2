'use client';

import { Agent } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Bot } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  currentTaskTitle?: string;
}

export function AgentCard({ agent, currentTaskTitle }: AgentCardProps) {
  const statusColors = {
    idle: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-slate-400',
    error: 'bg-red-500',
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
            statusColors[agent.status]
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-900 truncate">{agent.name}</p>
        <p className="text-xs text-slate-500 truncate">{agent.role}</p>
        {currentTaskTitle && (
          <p className="text-xs text-blue-600 truncate mt-0.5">{currentTaskTitle}</p>
        )}
      </div>
    </div>
  );
}
