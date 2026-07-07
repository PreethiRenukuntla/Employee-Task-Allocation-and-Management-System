import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Star, CheckSquare, Trash2 } from 'lucide-react';
import AddTeamMemberModal from '../components/modals/AddTeamMemberModal';
import FeedbackModal from '../components/modals/FeedbackModal';
import api from '../services/api';

const Team = () => {
  const { user } = useContext(AuthContext);
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await api.get('/users/performance');
      setTeam(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberAdded = () => {
    fetchTeam();
    setIsAddModalOpen(false);
  };

  const handleRemoveMember = async (employeeId) => {
    if (window.confirm('Are you sure you want to remove this member from your team?')) {
      try {
        await api.put(`/users/${employeeId}/assign`, { action: 'remove' });
        setTeam(prev => prev.filter(m => m._id !== employeeId));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openFeedback = (employee) => {
    setSelectedEmployee(employee);
    setIsFeedbackModalOpen(true);
  };

  if (loading) return <div className="text-slate-400">Loading team...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Team</h1>
          <p className="text-slate-400 text-sm">Manage your team members and track performance.</p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center shrink-0">
            <UserPlus className="w-4 h-4 mr-2" /> Add Member
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.map(member => (
          <div key={member._id} className="glass-card p-6 flex flex-col group relative overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => openFeedback(member)}
                 className="p-1.5 bg-slate-800 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-md transition-colors"
                 title="Give Feedback"
              >
                <Star className="w-4 h-4" />
              </button>
              {(user?.role === 'manager' || user?.role === 'admin') && (
                <button 
                  onClick={() => handleRemoveMember(member._id)}
                  className="p-1.5 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-md transition-colors"
                  title="Remove from team"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center mb-6 pt-2">
               <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg mr-4">
                 {member.name.charAt(0)}
               </div>
               <div>
                  <h3 className="text-white font-semibold">{member.name}</h3>
                  <p className="text-slate-400 text-xs">{member.email}</p>
               </div>
            </div>

            <div className="space-y-4 flex-1">
               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-400">Task Completion</span>
                   <span className="text-white font-medium">{member.completionRate}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-1.5">
                   <div 
                      className={`h-1.5 rounded-full ${member.completionRate >= 80 ? 'bg-green-500' : member.completionRate >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${member.completionRate}%` }}
                    ></div>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-slate-700/50">
                  <div className="glass-card p-2 bg-slate-800/30 border-0 flex flex-col items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-slate-500 mb-1" />
                    <span className="text-white font-medium">{member.completedTasks}/{member.totalTasks}</span>
                    <span className="text-[10px] text-slate-500">Tasks</span>
                  </div>
                  <div className="glass-card p-2 bg-slate-800/30 border-0 flex flex-col items-center justify-center">
                    <div className="flex items-center gap-1 mb-1">
                       <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    </div>
                    <span className="text-white font-medium">{member.avgRating} <span className="text-[10px] text-slate-500 font-normal">({member.feedbackCount})</span></span>
                    <span className="text-[10px] text-slate-500">Avg Rating</span>
                  </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {team.length === 0 && (
         <div className="text-center p-12 glass-card">
           <p className="text-slate-400">No team members found.</p>
         </div>
      )}

      <AddTeamMemberModal 
         isOpen={isAddModalOpen} 
         onClose={() => setIsAddModalOpen(false)} 
         onMemberAdded={handleMemberAdded} 
      />
      
      <FeedbackModal 
         isOpen={isFeedbackModalOpen} 
         onClose={() => { setIsFeedbackModalOpen(false); setSelectedEmployee(null); }}
         onFeedbackCreated={() => fetchTeam()}
         preselectedEmployee={selectedEmployee}
      />
    </div>
  );
};

export default Team;
