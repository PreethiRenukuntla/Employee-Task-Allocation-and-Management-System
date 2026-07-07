import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Loader2, User } from 'lucide-react';
import api from '../../services/api';

const AddTeamMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.get('/users/unassigned')
        .then((res) => setEmployees(res.data.data))
        .catch(() => setError('Failed to load employees'))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleAdd = async (employee) => {
    setAddingId(employee._id);
    try {
      await api.put(`/users/${employee._id}/assign`, { action: 'assign' });
      setEmployees((prev) => prev.filter((e) => e._id !== employee._id));
      onMemberAdded(employee);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setAddingId(null);
    }
  };

  const filtered = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add Team Member</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              className="input-field pl-9"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="p-4 max-h-80 overflow-y-auto space-y-2">
          {error && (
            <div className="text-red-400 text-sm text-center py-2">{error}</div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
            </div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="text-center text-slate-500 py-8 text-sm">
              {employees.length === 0 ? 'No unassigned employees available.' : 'No match found.'}
            </div>
          )}
          {filtered.map((emp) => (
            <div
              key={emp._id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors border border-slate-700/30"
            >
              <div className="w-9 h-9 rounded-full bg-primary-600/20 flex items-center justify-center text-sm font-semibold text-primary-400 flex-shrink-0">
                {emp.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{emp.name}</p>
                <p className="text-slate-500 text-xs truncate">{emp.email}</p>
              </div>
              <button
                onClick={() => handleAdd(emp)}
                disabled={addingId === emp._id}
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5 flex-shrink-0"
              >
                {addingId === emp._id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <UserPlus className="w-3 h-3" />
                )}
                Add
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-700/50">
          <button onClick={onClose} className="btn-secondary w-full">Done</button>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberModal;
