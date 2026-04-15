import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  User, 
  LogOut, 
  GraduationCap, 
  ChevronRight,
  Trophy,
  BarChart
} from 'lucide-react';
import { useAuth } from '../App';

const Sidebar = ({ role }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to terminate your session?')) {
      logout();
      navigate('/login');
    }
  };

  const studentLinks = [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/exams', icon: BookOpen, label: 'Exams Hall' },
    { to: '/student/history', icon: History, label: 'My Progress' },
    { to: '/student/leaderboard', icon: Trophy, label: 'Leaderboard' },
    { to: '/student/profile', icon: User, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: LayoutDashboard, label: 'Admin Panel' },
    { to: '/admin/exams', icon: BookOpen, label: 'Manage Exams' },
    { to: '/admin/reports', icon: BarChart, label: 'Exam Reports' },
    { to: '/admin/students', icon: GraduationCap, label: 'Student Flow' },
  ];

  const links = role === 'ADMIN' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar flex flex-col shadow-2xl shadow-sky-100">
      <div className="flex items-center gap-4 px-2 mb-12">
        <div className="w-12 h-12 bg-primary rounded-[18px] flex items-center justify-center shadow-xl shadow-sky-200">
          <GraduationCap className="text-white" size={28} />
        </div>
        <div>
          <h1 className="text-xl font-black text-text-dark tracking-tighter leading-none">ExamPro</h1>
          <p className="text-[9px] uppercase tracking-widest text-primary font-black mt-1">Enterprise v2</p>
        </div>
      </div>

      <nav className="flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link group ${isActive ? 'active' : ''}`}
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-white shadow-lg shadow-sky-100' : 'bg-transparent text-text-muted group-hover:bg-sky-50 group-hover:text-primary'}`}>
                  {link.icon && <link.icon size={20} />}
                </div>
                <span className={`flex-1 text-sm font-bold ${isActive ? 'text-text-dark' : 'text-text-muted'}`}>{link.label}</span>
                <ChevronRight size={14} className={`transition-all ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-sky-50/50">
        <div className="p-5 rounded-[24px] bg-gradient-to-br from-white to-sky-50 border border-white shadow-lg mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
               <p className="text-xs font-black text-text-dark truncate">{user?.name}</p>
               <p className="text-[9px] font-bold text-primary uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 px-6 py-4 w-full text-red-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Exit Portal</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
