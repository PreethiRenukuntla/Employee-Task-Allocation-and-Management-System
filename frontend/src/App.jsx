import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import { ErrorBoundary } from './components/ErrorBoundary';

import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Feedback from './pages/Feedback';
import Users from './pages/Users';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                 <Route path="/" element={<Navigate to="/dashboard" />} />
                 <Route path="/dashboard" element={<Dashboard />} />
                 <Route path="/tasks" element={<Tasks />} />
                 <Route path="/team" element={<Team />} />
                 <Route path="/feedback" element={<Feedback />} />
                 <Route path="/users" element={<Users />} />
              </Route>
            </Routes>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
