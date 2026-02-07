'use client';

import { useState } from 'react';
import { Document, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  FileText,
  Image,
  FileCode,
  File,
  Download,
  ExternalLink,
  FolderOpen,
  Search,
  X,
  Filter,
} from 'lucide-react';

interface DocumentPanelProps {
  documents: Document[];
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
}

const fileTypeIcons = {
  code: FileCode,
  doc: FileText,
  image: Image,
  other: File,
};

const fileTypeColors = {
  code: 'bg-blue-100 text-blue-600',
  doc: 'bg-orange-100 text-orange-600',
  image: 'bg-purple-100 text-purple-600',
  other: 'bg-slate-100 text-slate-600',
};

export function DocumentPanel({
  documents,
  tasks,
  isOpen,
  onClose,
}: DocumentPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Document['type'] | 'all'>('all');

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tasks
        .find((t) => t.id === doc.taskId)
        ?.title.toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  const getTaskTitle = (taskId: string) => {
    return tasks.find((t) => t.id === taskId)?.title || 'Unknown Task';
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <FolderOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Deliverables</h2>
            <p className="text-sm text-slate-500">{filteredDocuments.length} files</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1">
            {(['all', 'code', 'doc', 'image'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'px-3 py-1 text-xs rounded-full transition-colors',
                  filterType === type
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No files found</p>
            <p className="text-sm text-slate-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDocuments.map((doc) => {
              const Icon = fileTypeIcons[doc.type];
              return (
                <div
                  key={doc.id}
                  className="group bg-slate-50 rounded-lg p-4 border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                        fileTypeColors[doc.type]
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-900 text-sm truncate">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {getTaskTitle(doc.taskId)}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-400">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        {formatFileSize(1024 * 100) && (
                          <span className="text-xs text-slate-400">
                            {formatFileSize(1024 * 100)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-white rounded transition-colors"
                        title="Open"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-500" />
                      </a>
                      <a
                        href={doc.url}
                        download
                        className="p-1.5 hover:bg-white rounded transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
