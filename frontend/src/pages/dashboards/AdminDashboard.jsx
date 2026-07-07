import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, active: 0, inactive: 0 });
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users');
        const users = res.data.data;
        
        setStats({
          users: users.length,
          active: users.filter(u => u.status === 'active').length,
          inactive: users.filter(u => u.status === 'inactive').length,
        });

        const roles = {};
        users.forEach(u => {
           roles[u.role] = (roles[u.role] || 0) + 1;
        });
        setPieData(Object.keys(roles).map(key => ({ name: key, value: roles[key] })));
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const chartData = [
    { name: 'Active Users', count: stats.active },
    { name: 'Inactive Users', count: stats.inactive },
  ];

  if (loading) return <div className="text-slate-400">Loading admin dashboard...</div>;

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444']; // employer, manager, employee, admin

  return (
    <div className="space-y-6 animate-fade-in relative">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-white">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex items-center shadow-lg shadow-primary-500/10 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center mr-4">
            <Users className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Total Users</p>
            <h3 className="text-3xl font-bold text-white">{stats.users}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center shadow-lg shadow-green-500/10 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-green-500/20 flex items-center justify-center mr-4">
            <CheckCircle className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Active Users</p>
            <h3 className="text-3xl font-bold text-white">{stats.active}</h3>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center shadow-lg shadow-red-500/10 hover:-translate-y-1 transition-transform">
          <div className="w-14 h-14 rounded-xl bg-red-500/20 flex items-center justify-center mr-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">Inactive Users</p>
            <h3 className="text-3xl font-bold text-white">{stats.inactive}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
         <div className="glass-card p-6 h-96">
            <h3 className="text-lg font-semibold text-white mb-6">User Role Distribution</h3>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                 <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label>
                    {pieData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#f8fafc' }} />
              </PieChart>
            </ResponsiveContainer>
         </div>
         
         <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-6">System Management</h3>
            <div className="space-y-4">
              <a href="/users" className="block text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 transition-colors flex justify-between items-center group">
                 <span>Manage Users</span>
                 <Users className="text-slate-500 group-hover:text-primary-400 transition-colors" />
              </a>
              <button className="w-full text-left p-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 transition-colors flex justify-between items-center group cursor-not-allowed opacity-50">
                 <span>System Settings (Coming Soon)</span>
                 <AlertCircle className="text-slate-500 group-hover:text-primary-400 transition-colors" />
              </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
