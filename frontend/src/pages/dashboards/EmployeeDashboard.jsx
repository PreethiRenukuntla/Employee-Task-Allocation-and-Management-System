import React, { useState, useEffect } from 'react';
import { CheckSquare, Clock, AlertCircle, MessageSquare } from 'lucide-react';
import TaskCard from '../../components/TaskCard';
import StarRating from '../../components/StarRating';
import api from '../../services/api';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, fbRes] = await Promise.all([
           api.get('/tasks'),
           api.get('/feedback')
        ]);
        setTasks(tasksRes.data.data);
        setFeedbacks(fbRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const pendingCount = (tasks || []).filter(t => t.status === 'pending').length;
  const inProgressCount = (tasks || []).filter(t => t.status === 'in-progress').length;
  const completedCount = (tasks || []).filter(t => t.status === 'completed').length;

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      
      const workUpdate = newStatus === 'completed' 
        ? window.prompt("Add a short work update/note for your manager (optional):") 
        : undefined;

      await api.put(`/tasks/${taskId}`, { status: newStatus, ...(workUpdate && { workUpdate }) });
      
      if (workUpdate) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, workUpdate } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400">Loading your tasks...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-center items-center shadow-lg shadow-amber-500/10 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <AlertCircle className="w-8 h-8 text-amber-400 mb-3" />
          <h3 className="text-4xl font-bold text-white mb-1">{pendingCount}</h3>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Pending Tasks</p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center shadow-lg shadow-blue-500/10 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Clock className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="text-4xl font-bold text-white mb-1">{inProgressCount}</h3>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">In Progress</p>
        </div>

        <div className="glass-card p-6 flex flex-col justify-center items-center shadow-lg shadow-green-500/10 hover:-translate-y-1 transition-transform relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <CheckSquare className="w-8 h-8 text-green-400 mb-3" />
          <h3 className="text-4xl font-bold text-white mb-1">{completedCount}</h3>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Completed</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
         <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">My Active Tasks</h2>
              <a href="/tasks" className="text-primary-400 text-sm hover:text-primary-300">View All</a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {(tasks || []).filter(t => t.status !== 'completed').slice(0,4).map(task => (
                 <TaskCard 
                    key={task._id} 
                    task={task} 
                    showAssignee={false}
                    onStatusChange={handleStatusChange}
                 />
               ))}
               {(tasks || []).filter(t => t.status !== 'completed').length === 0 && (
                  <div className="col-span-2 text-center p-8 glass-card text-slate-400">
                    You have no active tasks! You are all caught up.
                  </div>
               )}
            </div>
         </div>

         <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Recent Feedback</h2>
              <a href="/feedback" className="text-primary-400 text-sm hover:text-primary-300">View All</a>
            </div>
            <div className="space-y-4">
               {(feedbacks || []).slice(0, 3).map(fb => (
                 <div key={fb._id} className="glass-card p-4">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                         <p className="text-slate-300 text-sm font-medium">{fb.givenBy?.name}</p>
                         <p className="text-xs text-slate-500">{new Date(fb.createdAt).toLocaleDateString()}</p>
                       </div>
                       <StarRating value={fb.rating} readonly size="sm" />
                    </div>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-2">"{fb.message}"</p>
                 </div>
               ))}
               {feedbacks.length === 0 && (
                 <div className="text-center p-8 glass-card border border-dashed border-slate-700/50">
                    <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No feedback received yet.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
