import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { user, token } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const buildNotifications = useCallback((tasks, feedbacks) => {
    const items = [];

    // Recent tasks (last 7 days)
    tasks.forEach((t) => {
      const created = new Date(t.createdAt);
      const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) {
        if (user?.role === 'employee') {
          items.push({
            id: `task-${t._id}`,
            type: 'task',
            title: `New Task Assigned`,
            body: t.title,
            time: t.createdAt,
            read: false,
          });
        }
      }
    });

    // Recent feedback (last 7 days)
    feedbacks.forEach((f) => {
      const created = new Date(f.createdAt);
      const daysSince = (Date.now() - created) / (1000 * 60 * 60 * 24);
      if (daysSince <= 7) {
        items.push({
          id: `feedback-${f._id}`,
          type: 'feedback',
          title: user?.role === 'employee' ? 'New Feedback Received' : 'Feedback Given',
          body: f.message.slice(0, 60) + (f.message.length > 60 ? '...' : ''),
          time: f.createdAt,
          read: false,
        });
      }
    });

    // Sort by newest first, limit to 8
    items.sort((a, b) => new Date(b.time) - new Date(a.time));
    return items.slice(0, 8);
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!token || !user) return;
    try {
      const [tasksRes, feedbackRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/feedback'),
      ]);
      const built = buildNotifications(tasksRes.data.data, feedbackRes.data.data);
      setNotifications(built);
      setUnreadCount(built.length);
    } catch (err) {
      // Silently fail — notifications are non-critical
    }
  }, [token, user, buildNotifications]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
