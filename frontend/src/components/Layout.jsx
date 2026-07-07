import React, { useState, useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, MessageSquare, LogOut, Menu, UserCircle, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unreadCount, markAllRead } = useContext(NotificationContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Auto-close sidebar on mobile on route change
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getLinks = () => {
    const role = user?.role;
    let links = [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    
    if (role === 'admin') {
      links.push({ path: '/users', label: 'Manage Users', icon: Users });
    }
    if (role === 'employer' || role === 'manager') {
      links.push({ path: '/team', label: 'My Team', icon: Users });
    }
    if (role === 'manager' || role === 'employee' || role === 'employer' || role === 'admin') {
      links.push({ path: '/tasks', label: 'Tasks', icon: CheckSquare });
    }
    if (role !== 'admin') {
       links.push({ path: '/feedback', label: 'Feedback', icon: MessageSquare });
    }
    
    return links;
  };

  const links = getLinks();

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar */}
       <aside className={`sidebar-container absolute z-30 md:relative transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">TaskFlow</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-1">
          {links.map((link) => {
             const Icon = link.icon;
             const isActive = location.pathname.includes(link.path);
             return (
               <Link 
                 key={link.path} 
                 to={link.path} 
                 className={`nav-item group ${isActive ? 'active' : ''}`}
               >
                 <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary-400' : 'text-slate-400'}`} />
                 {link.label}
               </Link>
             )
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-900/50 rounded-xl p-4 flex items-center gap-3 border border-slate-800/50">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold shrink-0">
               {user?.name?.charAt(0) || <UserCircle className="w-6 h-6 text-slate-400" />}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate text-white">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 glass-card border-x-0 border-t-0 rounded-none flex items-center justify-between px-6 z-20 w-full relative shrink-0">
          <div className="flex items-center gap-4">
             <button 
                className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/50"
                onClick={() => setSidebarOpen(!sidebarOpen)}
             >
               <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-white font-semibold hidden sm:block capitalize">{location.pathname.split('/')[1] || 'Dashboard'}</h2>
          </div>
          
          <div className="ml-auto flex items-center gap-4 relative">
             <button 
                onClick={() => { setNotificationsOpen(!notificationsOpen); if(unreadCount>0) markAllRead(); }} 
                className="relative p-2 text-slate-400 hover:text-white transition-colors"
             >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                )}
             </button>

             {/* Notifications Dropdown */}
             {notificationsOpen && (
               <div className="absolute top-12 right-0 w-80 glass-card border border-slate-700/50 shadow-2xl rounded-xl overflow-hidden animate-slide-up origin-top-right">
                  <div className="p-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-white font-semibold flex items-center gap-2"><Bell className="w-4 h-4 text-primary-400"/> Notifications</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
                     {notifications.length === 0 ? (
                        <div className="p-4 text-center text-slate-500 text-sm">No recent notifications.</div>
                     ) : (
                        notifications.map(n => (
                           <Link key={n.id} to={`/${n.type === 'task' ? 'tasks' : 'feedback'}`} onClick={() => setNotificationsOpen(false)} className="block p-3 hover:bg-slate-800/50 rounded-lg transition-colors">
                              <p className="text-sm text-slate-200 font-medium">{n.title}</p>
                              <p className="text-xs text-slate-400 truncate mt-0.5">{n.body}</p>
                              <p className="text-[10px] text-slate-500 mt-1">{formatDistanceToNow(new Date(n.time))} ago</p>
                           </Link>
                        ))
                     )}
                  </div>
               </div>
             )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-900/10 via-background to-background pointer-events-none -z-10"></div>
          <Outlet />
        </main>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
