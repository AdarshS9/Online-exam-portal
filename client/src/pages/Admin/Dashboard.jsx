import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Users, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  BarChart
} from 'lucide-react';
import { useAuth } from '../../App';

const StatCard = ({ icon: Icon, label, value, subtext, color }) => (
  <div className="glass-card p-8 animate-slide">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={28} />
      </div>
      <div className="p-2 bg-green-50 rounded-lg text-green-600">
        <ArrowUpRight size={16} />
      </div>
    </div>
    <h3 className="text-3xl font-black text-text-dark">{value}</h3>
    <p className="text-sm font-bold text-text-muted mt-1 uppercase tracking-wider">{label}</p>
    <p className="text-xs text-green-600 font-semibold mt-4 flex items-center gap-1">
      {subtext}
    </p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalExams: 0, totalStudents: 0, totalSubmissions: 0 });
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      <header className="flex justify-between items-end bg-white/40 p-10 rounded-[40px] border border-white/60 shadow-xl shadow-sky-100/50">
        <div>
          <span className="badge bg-primary/10 text-primary border-primary/20 mb-4 inline-block">Administrator</span>
          <h1 className="text-4xl font-black text-dark tracking-tight">System Overview</h1>
          <p className="text-text-muted mt-2 font-medium">Monitoring platform performance and student engagement.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-neumorph px-8">System Logs</button>
          <button className="btn-primary shadow-sky-200">+ Configure Exam</button>
        </div>
      </header>

      <div className="grid grid-4 gap-6">
        <StatCard 
          icon={FileText} 
          label="Active Exams" 
          value={stats.totalExams} 
          subtext="⚡ 2 Published today"
          color="bg-sky-500"
        />
        <StatCard 
          icon={Users} 
          label="Enrollments" 
          value={stats.totalStudents} 
          subtext="📈 +12% growth"
          color="bg-indigo-500"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Submissions" 
          value={stats.totalSubmissions} 
          subtext="✅ 98.4% Completion"
          color="bg-emerald-500"
        />
        <StatCard 
          icon={Calendar} 
          label="Scheduled" 
          value="4" 
          subtext="🕒 Next in 2h"
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-3">
        {/* Performance Chart Placeholder */}
        <div className="glass-card p-10 col-span-2">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black text-text-dark flex items-center gap-2">
              <BarChart className="text-primary" /> Performance Analytics
            </h3>
            <select className="bg-sky-50 text-xs font-bold py-2 px-4 rounded-xl border-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end gap-6 px-4">
             {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-4">
                 <div 
                   className="w-full bg-gradient-to-t from-sky-100 to-primary rounded-xl transition-all hover:scale-105 cursor-pointer shadow-lg shadow-sky-100" 
                   style={{ height: `${h}%` }}
                 />
                 <span className="text-[10px] font-black text-text-muted uppercase">day {i+1}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Global Leaderboard Snapshot */}
        <div className="glass-card p-10">
          <h3 className="text-xl font-black text-text-dark mb-8 flex items-center gap-2">
            <Target className="text-primary" /> Top Performers
          </h3>
          <div className="space-y-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${n === 1 ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 text-slate-400'}`}>
                  {n}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-text-dark">Student {n}</p>
                  <p className="text-[10px] text-text-muted">98.5% Average Score</p>
                </div>
                <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '90%' }} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 p-4 border border-sky-100 rounded-2xl text-xs font-black text-primary hover:bg-sky-50 transition-all uppercase tracking-widest">
            View All Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
