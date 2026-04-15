import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  ArrowRight, 
  Play, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  Bell,
  Star,
  Users
} from 'lucide-react';
import { useAuth } from '../../App';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [rank, setRank] = useState(1); // Demo rank

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsRes = await fetch('http://localhost:5000/api/exams/published', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const dashRes = await fetch('http://localhost:5000/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (examsRes.ok) setExams(await examsRes.json());
        if (dashRes.ok) {
          const data = await dashRes.json();
          setHistory(data.history);
          setRank(data.rank || 1);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const completedExams = history.filter(h => h.status === 'SUBMITTED');
  const avgScore = completedExams.length > 0 
    ? (completedExams.reduce((acc, curr) => acc + curr.score, 0) / completedExams.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-in pb-20">
      {/* Top Header Section */}
      <header className="flex flex-col md:flex-row gap-8 items-stretch">
        <div className="flex-1 welcome-gradient p-12 rounded-[40px] shadow-2xl shadow-sky-200/50 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-white leading-tight">Good Morning,<br/>{user?.name}! ✨</h1>
            <p className="text-sky-100 mt-4 text-lg font-medium max-w-md">Your goal this week is to complete 3 more assessments. You're currently on track!</p>
            <button 
              onClick={() => navigate('/student/exams')}
              className="mt-10 btn-neumorph bg-white hover:bg-white/90 border-none px-10 py-5 text-primary text-lg font-black group shadow-2xl"
            >
              Start Learning <ArrowRight className="inline-block ml-2 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
          <Trophy className="absolute right-[-20px] bottom-[-20px] text-white/10 group-hover:scale-110 transition-transform duration-700" size={300} />
        </div>

        <div className="w-full md:w-96 glass-card p-10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white to-sky-50 shadow-xl border-white">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full border-[6px] border-primary flex items-center justify-center font-black text-4xl text-primary shadow-lg shadow-sky-100 italic">
              #{rank}
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-lg text-white shadow-lg">
              <Star size={16} fill="white" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-text-dark">Top Performer</h3>
          <p className="text-text-muted mt-2 font-medium">Global Rank among 450+ Active Students</p>
          <div className="w-full h-px bg-sky-100 my-8" />
          <div className="flex gap-4 w-full">
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Avg. Score</p>
              <p className="text-2xl font-black text-primary">{avgScore}%</p>
            </div>
            <div className="w-px h-10 bg-sky-100 self-center" />
            <div className="flex-1 text-center">
              <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Completed</p>
              <p className="text-2xl font-black text-primary">{completedExams.length}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="grid grid-3 gap-10">
        {/* Upcoming Exams Widget */}
        <div className="col-span-2 space-y-8">
          <div className="flex justify-between items-center px-4">
            <h2 className="text-2xl font-black text-text-dark flex items-center gap-3">
              <Calendar className="text-primary" /> Active Examination Hall
            </h2>
            <button onClick={() => navigate('/student/exams')} className="text-primary text-sm font-black uppercase tracking-widest hover:underline">View All</button>
          </div>

          <div className="grid grid-2 gap-6">
            {exams.filter(e => e.user_attempt_status !== 'SUBMITTED').slice(0, 4).map((exam) => (
              <div key={exam.id} className="glass-card p-8 group hover:border-primary transition-all relative overflow-hidden bg-white">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary" />
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 rounded-2xl bg-sky-50 text-primary font-black group-hover:scale-110 transition-transform">
                    {exam.duration}m
                  </div>
                  <Bell className="text-sky-200" size={20} />
                </div>
                <h4 className="text-xl font-bold text-text-dark mb-2">{exam.title}</h4>
                <p className="text-sm text-text-muted mb-8 line-clamp-2">{exam.description || 'Basic assessment for proficiency validation.'}</p>
                
                <button 
                  onClick={() => navigate(`/student/exam/${exam.id}`)}
                  className="btn-primary w-full py-4 text-sm font-black tracking-widest uppercase flex items-center justify-center gap-3 group/btn"
                >
                  Enter Exam <Play size={16} className="group-hover/btn:scale-110 transition-transform" />
                </button>
              </div>
            ))}
            {exams.length === 0 && <p className="col-span-2 p-12 glass-card text-center text-text-muted">No exams available currently.</p>}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-10">
          {/* Notifications Widget */}
          <div className="glass-card p-10 space-y-6 bg-white">
            <h3 className="text-lg font-black text-text-dark flex items-center justify-between">
              Activity Stream <span className="bg-primary/10 text-primary text-[10px] px-3 py-1 rounded-full uppercase">3 New</span>
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Result Published', desc: 'JavaScript Basics results are out!', time: '10m ago', icon: Activity },
                { label: 'New Exam Added', desc: 'React Hooks Mastery is live.', time: '2h ago', icon: Star },
                { label: 'Profile Update', desc: 'You updated your bio.', time: 'Yesterday', icon: Users },
              ].map((n, i) => (
                <div key={i} className="flex gap-4 group">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 group-hover:scale-150 transition-all shadow-lg" />
                  <div>
                    <p className="text-sm font-bold text-text-dark">{n.label}</p>
                    <p className="text-[10px] text-text-muted mt-0.5">{n.desc}</p>
                    <p className="text-[9px] text-primary/50 font-black uppercase mt-1 tracking-widest">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="glass-card p-10 bg-gradient-to-br from-white to-sky-50 border-sky-100">
             <div className="flex items-center gap-4 mb-8">
               <div className="p-4 rounded-[20px] bg-white shadow-xl shadow-sky-100">
                 <TrendingUp className="text-primary" size={24} />
               </div>
               <div>
                  <h4 className="font-black text-text-dark">Growth Metric</h4>
                  <p className="text-xs text-text-muted font-bold">+15% improvement</p>
               </div>
             </div>
             <div className="flex flex-col gap-3">
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-sky-100">
                  <div className="h-full bg-primary" style={{ width: '65%' }} />
                </div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Mastery Level: 65%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
