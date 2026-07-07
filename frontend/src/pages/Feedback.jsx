import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, Star, Reply, Plus } from 'lucide-react';
import FeedbackModal from '../components/modals/FeedbackModal';
import StarRating from '../components/StarRating';
import api from '../services/api';

const Feedback = () => {
  const { user } = useContext(AuthContext);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replyInputs, setReplyInputs] = useState({});

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/feedback');
      setFeedbacks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id, value) => {
    setReplyInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id) => {
    const replyText = replyInputs[id];
    if (!replyText?.trim()) return;

    try {
      await api.put(`/feedback/${id}/reply`, { reply: replyText });
      setReplyInputs(prev => ({ ...prev, [id]: '' }));
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this feedback?')) {
      try {
        await api.delete(`/feedback/${id}`);
        setFeedbacks(prev => prev.filter(f => f._id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-slate-400">Loading feedback...</div>;

  return (
    <div className="space-y-6 animate-fade-in relative max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Performance Feedback</h1>
          <p className="text-slate-400 text-sm">Review performance feedback and ratings.</p>
        </div>
        {(user?.role === 'manager' || user?.role === 'admin') && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Give Feedback
          </button>
        )}
      </div>

      <div className="space-y-4">
        {feedbacks.map(item => (
          <div key={item._id} className="glass-card overflow-hidden">
             <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-semibold text-white">
                         {item.givenBy?.name.charAt(0)}
                      </div>
                      <div>
                         <p className="text-white text-sm font-medium">
                            {user?.role === 'employee' ? item.givenBy?.name : `To: ${item.givenTo?.name}`}
                            {item.taskId && <span className="text-slate-500 font-normal ml-2">on task: <span className="text-slate-300">"{item.taskId.title}"</span></span>}
                         </p>
                         <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                       <StarRating value={item.rating} readonly size="sm" />
                       {(user?.role === 'manager' || user?.role === 'admin') && (
                          <button onClick={() => handleDelete(item._id)} className="text-xs text-slate-500 hover:text-red-400">Delete</button>
                       )}
                   </div>
                </div>

                <div className="p-4 bg-slate-800/30 rounded-xl rounded-tl-none border border-slate-700/50 mb-2">
                   <p className="text-slate-300 text-sm">{item.message}</p>
                </div>

                {/* Reply section */}
                {item.employeeReply ? (
                   <div className="mt-4 pl-12 flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-900/30 flex items-center justify-center font-semibold text-primary-400 shrink-0">
                        {item.givenTo?.name.charAt(0)}
                      </div>
                      <div className="p-3 bg-primary-900/10 rounded-xl rounded-tl-none border border-primary-500/20 text-sm text-slate-300 w-full">
                         <p className="text-xs text-primary-400 mb-1">Reply from {item.givenTo?.name}</p>
                         <p>{item.employeeReply}</p>
                      </div>
                   </div>
                ) : user?.role === 'employee' && item.givenTo?._id === user?._id ? (
                   <div className="mt-4 pl-12 flex gap-2">
                      <input 
                         type="text" 
                         className="input-field text-sm py-2" 
                         placeholder="Write a reply..."
                         value={replyInputs[item._id] || ''}
                         onChange={(e) => handleReplyChange(item._id, e.target.value)}
                      />
                      <button 
                         onClick={() => handleReplySubmit(item._id)}
                         className="btn-primary px-4 py-2 flex items-center gap-2"
                      >
                         <Reply className="w-4 h-4" />
                      </button>
                   </div>
                ) : null}
             </div>
          </div>
        ))}

        {feedbacks.length === 0 && (
           <div className="text-center p-12 glass-card">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No feedback found.</p>
           </div>
        )}
      </div>

      <FeedbackModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onFeedbackCreated={() => fetchFeedbacks()}
      />
    </div>
  );
};

export default Feedback;
