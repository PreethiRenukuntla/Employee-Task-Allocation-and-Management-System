import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Loader2 } from 'lucide-react';
import StarRating from '../StarRating';
import api from '../../services/api';

const FeedbackModal = ({ isOpen, onClose, onFeedbackCreated, preselectedEmployee = null }) => {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState({
    givenTo: preselectedEmployee?._id || '',
    taskId: '',
    rating: 0,
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.get('/users'), api.get('/tasks')]).then(([usersRes, tasksRes]) => {
        setEmployees(usersRes.data.data);
        setTasks(tasksRes.data.data.filter((t) => t.status === 'completed'));
      }).catch(() => {});

      if (preselectedEmployee) {
        setFormData((prev) => ({ ...prev, givenTo: preselectedEmployee._id }));
      }
    }
  }, [isOpen, preselectedEmployee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setError('Please select a rating');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData };
      if (!payload.taskId) delete payload.taskId;
      const res = await api.post('/feedback', payload);
      onFeedbackCreated(res.data.data);
      setFormData({ givenTo: '', taskId: '', rating: 0, message: '' });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTasks = formData.givenTo
    ? tasks.filter((t) => t.assignedTo?._id === formData.givenTo)
    : tasks;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Give Feedback</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Employee *</label>
            <select
              className="input-field"
              value={formData.givenTo}
              onChange={(e) => setFormData({ ...formData, givenTo: e.target.value, taskId: '' })}
              required
              disabled={!!preselectedEmployee}
            >
              <option value="">Select employee...</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Related Task (optional)</label>
            <select
              className="input-field"
              value={formData.taskId}
              onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
            >
              <option value="">No specific task</option>
              {filteredTasks.map((t) => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Rating *</label>
            <div className="flex items-center gap-3">
              <StarRating
                value={formData.rating}
                onChange={(val) => setFormData({ ...formData, rating: val })}
                size="lg"
              />
              <span className="text-slate-400 text-sm">
                {formData.rating > 0 ? `${formData.rating}/5` : 'Click to rate'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Feedback Message *</label>
            <textarea
              className="input-field resize-none"
              rows={4}
              placeholder="Share your feedback on this employee's performance..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
