import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';
import TaskCard from '../components/TaskCard';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import api from '../services/api';

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}`, { status: newStatus });
    } catch (err) {
      console.error(err);
      fetchTasks(); // Revert on failure
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(prev => prev.filter(t => t._id !== taskId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="text-slate-400">Loading tasks...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-slate-400 text-sm">Manage and track your project tasks.</p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center shrink-0">
            <Plus className="w-4 h-4 mr-2" /> New Task
          </button>
        )}
      </div>

      <div className="glass-card p-4 flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="input-field pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select 
            className="input-field max-w-[150px] appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
           <TaskCard 
              key={task._id} 
              task={task} 
              onStatusChange={handleStatusChange}
              onDelete={user?.role === 'manager' || user?.role === 'admin' ? handleDelete : undefined}
           />
        ))}
      </div>
      
      {filteredTasks.length === 0 && (
         <div className="text-center p-12 glass-card">
           <p className="text-slate-400">No tasks found matching your criteria.</p>
         </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={handleTaskCreated} 
      />
    </div>
  );
};

export default Tasks;
