import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import EmployerDashboard from './dashboards/EmployerDashboard';
import ManagerDashboard from './dashboards/ManagerDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'employer':
      return <EmployerDashboard />;
    case 'manager':
      return <ManagerDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return <div>Unknown Role</div>;
  }
};

export default Dashboard;
