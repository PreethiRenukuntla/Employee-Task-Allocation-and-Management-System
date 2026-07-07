import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Edit } from 'lucide-react';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete user completely?')) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(prev => prev.filter(u => u._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await api.put(`/users/${user._id}`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-400">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400 text-sm">System administration console.</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
               <thead className="bg-slate-800/50 text-slate-300 border-b border-slate-700/50">
                 <tr>
                   <th className="px-6 py-4 font-medium">User</th>
                   <th className="px-6 py-4 font-medium">Role</th>
                   <th className="px-6 py-4 font-medium">Status</th>
                   <th className="px-6 py-4 font-medium text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700/50">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-white">
                             {u.name[0]}
                           </div>
                           <div>
                             <p className="font-medium text-white">{u.name}</p>
                             <p className="text-xs text-slate-500">{u.email}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' : u.role === 'employer' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : u.role === 'manager' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                           {u.role}
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <button 
                            onClick={() => handleToggleStatus(u)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${u.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20' : 'bg-slate-800 text-slate-500 border-slate-700 hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/20'}`}
                            title="Click to toggle status"
                         >
                           {u.status}
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                         <button className="text-slate-500 hover:text-white transition-colors" title="Edit coming soon"><Edit className="w-4 h-4 inline" /></button>
                         <button onClick={() => handleDelete(u._id)} className="text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4 inline" /></button>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Users;
