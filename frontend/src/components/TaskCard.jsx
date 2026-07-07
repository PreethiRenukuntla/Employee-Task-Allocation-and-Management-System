import React from 'react';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Clock, AlertCircle, CheckCircle2, Loader2, User } from 'lucide-react';

const priorityConfig = {
  high: { label: 'High', cls: 'bg-red-500/10 text-red-400 border-red-500/20' },
  medium: { label: 'Medium', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  low: { label: 'Low', cls: 'bg-green-500/10 text-green-400 border-green-500/20' },
};

const statusConfig = {
  pending: { label: 'Pending', cls: 'bg-slate-700/50 text-slate-300 border-slate-600', icon: AlertCircle },
  'in-progress': { label: 'In Progress', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Loader2 },
  completed: { label: 'Completed', cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, showAssignee = true }) => {
  const priority = priorityConfig[task.priority] || priorityConfig.medium;
  const status = statusConfig[task.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const deadlinePast = isPast(new Date(task.deadline)) && task.status !== 'completed';

  return (
    <div className="glass-card p-5 hover:-translate-y-0.5 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/10 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h4 className="text-white font-semibold text-sm leading-tight flex-1">{task.title}</h4>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${priority.cls}`}>
            {priority.label}
          </span>
        </div>
      </div>

      <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{task.description}</p>

      {/* Assignee */}
      {showAssignee && task.assignedTo && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-primary-600/30 flex items-center justify-center text-xs text-primary-400 font-semibold">
            {task.assignedTo.name?.charAt(0)}
          </div>
          <span className="text-xs text-slate-400">{task.assignedTo.name}</span>
        </div>
      )}

      {/* Deadline */}
      <div className={`flex items-center gap-1.5 text-xs mb-4 ${deadlinePast ? 'text-red-400' : 'text-slate-500'}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>
          {deadlinePast ? '⚠ Overdue · ' : ''}
          {format(new Date(task.deadline), 'MMM d, yyyy')}
        </span>
      </div>

      {/* Work Update */}
      {task.workUpdate && (
        <div className="bg-slate-800/50 rounded-lg px-3 py-2 mb-3 text-xs text-slate-400 italic border-l-2 border-primary-500/40">
          "{task.workUpdate}"
        </div>
      )}

      {/* Status + Actions */}
      <div className="flex items-center justify-between gap-2">
        {onStatusChange ? (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            className="text-xs bg-slate-900/70 border border-slate-700 rounded-lg px-2 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary-500/50 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        ) : (
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.cls}`}>
            <StatusIcon className="w-3 h-3" />
            {status.label}
          </span>
        )}

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              className="text-xs text-slate-400 hover:text-primary-400 transition-colors"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
