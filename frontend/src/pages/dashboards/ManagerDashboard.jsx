import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, Plus, Clock } from 'lucide-react';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ManagerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, statsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/users/performance'),
        api.get('/tasks/stats')
      ]);
      setTasks(tasksRes.data.data);
      setEmployees(usersRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
      if (!stats) {
          setStats({ perEmployee: [], weeklyTrend: [], statusStats: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading your management suite...</div>;

  const getStatusColor = (status) => {
    switch(status) {
       case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
       case 'in-progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
       default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white">Management Suite</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center shrink-0">
          <Plus className="w-4 h-4 mr-2" /> Assign New Task
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-t-[3px] border-t-purple-500">
          <p className="text-slate-400 text-sm font-medium mb-1">My Team</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{employees.length}</h3>
            <Users className="w-6 h-6 text-purple-400 mb-1" />
          </div>
        </div>

        <div className="glass-card p-6 border-t-[3px] border-t-blue-500">
          <p className="text-slate-400 text-sm font-medium mb-1">Total Tasks Issued</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-bold text-white">{tasks.length}</h3>
            <CheckSquare className="w-6 h-6 text-blue-400 mb-1" />
          </div>
        </div>

        <div className="glass-card p-6 border-t-[3px] border-t-amber-500">
          <p className="text-slate-400 text-sm font-medium mb-1">Pending Review</p>
          <div className="flex items-end justify-between">
             <h3 className="text-3xl font-bold text-white">{tasks.filter(t => t.status === 'in-progress').length}</h3>
             <Clock className="w-6 h-6 text-amber-400 mb-1" />
          </div>
        </div>
        
        <div className="glass-card p-6 border-t-[3px] border-t-green-500">
          <p className="text-slate-400 text-sm font-medium mb-1">Completed Rate</p>
          <div className="flex items-end justify-between">
             <h3 className="text-3xl font-bold text-white">
                {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
             </h3>
             <CheckSquare className="w-6 h-6 text-green-400 mb-1" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
         <div className="lg:col-span-2 space-y-6">
           <div className="glass-card rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Recent Task Activity</h3>
                <a href="/tasks" className="text-primary-400 text-sm hover:text-primary-300">View All</a>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm text-slate-400">
                   <thead className="bg-slate-800/50 text-slate-300">
                     <tr>
                       <th className="px-6 py-4 font-medium">Task Details</th>
                       <th className="px-6 py-4 font-medium">Assignee</th>
                       <th className="px-6 py-4 font-medium">Status</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-700/50">
                     {tasks.slice(0,5).map(task => (
                        <tr key={task._id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                             <p className="font-medium text-white">{task.title}</p>
                             <p className="text-xs mt-1 max-w-[200px] truncate">{task.description}</p>
                          </td>
                          <td className="px-6 py-4">
                             {task.assignedTo?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(task.status)}`}>
                               {task.status}
                             </span>
                          </td>
                        </tr>
                     ))}
                     {tasks.length === 0 && (
                        <tr><td colSpan="3" className="px-6 py-8 text-center">No tasks found. Create one above!</td></tr>
                     )}
                   </tbody>
                 </table>
              </div>
           </div>

           <div className="glass-card p-6 h-80">
              <h3 className="text-lg font-semibold text-white mb-6">Team Workload Distribution</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={stats?.perEmployee || []}>
                   <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} />
                   <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
                   <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                   <Bar dataKey="inProgress" stackId="a" fill="#3b82f6" name="In Progress" />
                   <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
           </div>
         </div>

         <div className="glass-card p-6 h-fit">
            <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
            <ul className="space-y-4">
               {employees.map(emp => (
                 <li key={emp._id} className="p-3 rounded-xl hover:bg-slate-800/30 transition-colors border border-transparent hover:border-slate-700/50">
                   <div className="flex items-center mb-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-semibold mr-3">
                        {emp.name.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="text-white text-sm font-medium truncate">{emp.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{emp.email}</p>
                     </div>
                   </div>
                   <div className="pl-11 pr-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Completion</span>
                        <span className="text-white">{emp.completionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5">
                        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${emp.completionRate}%` }}></div>
                      </div>
                   </div>
                 </li>
               ))}
               {employees.length === 0 && (
                 <li className="text-sm text-slate-500 text-center py-4">No team members assigned yet.</li>
               )}
            </ul>
            <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
              <a href="/team" className="text-primary-400 text-sm hover:text-primary-300">Manage Team</a>
            </div>
         </div>
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onTaskCreated={() => fetchData()} 
      />
    </div>
  );
};

export default ManagerDashboard;
