import React, { useState, useEffect } from 'react';
import { Users, BarChart3, TrendingUp, CheckSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const EmployerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, tasksRes] = await Promise.all([
          api.get('/users/performance'),
          api.get('/tasks/stats')
        ]);
        
        const teamData = usersRes.data.data;
        const taskStats = tasksRes.data.data;
        
        let avgProductivity = 0;
        if (teamData.length > 0) {
          avgProductivity = Math.round(teamData.reduce((acc, emp) => acc + emp.completionRate, 0) / teamData.length);
        }

        const projectCount = taskStats.perEmployee.reduce((acc, emp) => acc + emp.total, 0);

        setStats({
           totalManagers: teamData.length, // Simplified to total employees for now, since employer views managers/employees
           activeProjects: projectCount,
           teamProductivity: avgProductivity,
           barChart: taskStats.perEmployee,
           lineChart: taskStats.weeklyTrend,
           pieChart: taskStats.statusStats.map(s => ({ name: s._id, value: s.count }))
        });

      } catch (err) {
         console.error(err);
         if (!stats) {
             setStats({ totalManagers: 0, activeProjects: 0, teamProductivity: 0, barChart: [], lineChart: [], pieChart: [] });
         }
      } finally {
         setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-slate-400">Loading company overview...</div>;

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#64748b'];

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white">Company Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center shadow-lg hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center mr-4">
            <Users className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Team Members</p>
            <h3 className="text-3xl font-bold text-white">{stats.totalManagers}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center shadow-lg hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-primary-500/20 flex items-center justify-center mr-4">
            <CheckSquare className="w-7 h-7 text-primary-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Tasks</p>
            <h3 className="text-3xl font-bold text-white">{stats.activeProjects}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center shadow-lg hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-amber-500/20 flex items-center justify-center mr-4">
            <TrendingUp className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Team Productivity</p>
            <h3 className="text-3xl font-bold text-white">{stats.teamProductivity}%</h3>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 h-96">
          <h3 className="text-lg font-semibold text-white mb-6">Task Load by Employee</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={stats.barChart}>
               <XAxis dataKey="name" stroke="#94a3b8" />
               <YAxis stroke="#94a3b8" />
               <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
               <Bar dataKey="total" fill="#14b8a6" radius={[4, 4, 0, 0]} name="Total Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 h-96">
          <h3 className="text-lg font-semibold text-white mb-6">Weekly Task Completion Trend</h3>
          <ResponsiveContainer width="100%" height="80%">
            <LineChart data={stats.lineChart}>
               <XAxis dataKey="_id" stroke="#94a3b8" />
               <YAxis stroke="#94a3b8" />
               <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
               <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Completed Tasks" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass-card p-6 h-96 lg:col-span-2">
           <h3 className="text-lg font-semibold text-white mb-6">Overall Task Status Distribution</h3>
           <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                 <Pie data={stats.pieChart} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" label>
                    {stats.pieChart.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EmployerDashboard;
