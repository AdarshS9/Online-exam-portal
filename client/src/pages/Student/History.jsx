import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, TrendingUp, Calendar, Trophy, Download } from 'lucide-react';

const StudentHistory = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/student/dashboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data.history);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Attempt History</h1>
          <p className="text-text-muted mt-1">Track your progress and performance over time.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-neumorph flex items-center gap-2"><Download size={18} /> Export CSV</button>
        </div>
      </header>

      {/* Analytics Summary */}
      <div className="grid grid-2">
        <div className="glass-card p-8 bg-gradient-to-br from-primary to-primary-deep text-white">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-sky-100 text-sm font-medium">Overall Progress</p>
              <h2 className="text-3xl font-bold mt-1">Excellent</h2>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Performance Level</span>
              <span>85%</span>
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 flex items-center justify-center border-dashed border-2 border-sky-100">
           <div className="text-center">
             <Trophy size={48} className="text-sky-300 mx-auto mb-4" />
             <p className="font-bold text-text-dark">Top Performer Badge</p>
             <p className="text-text-muted text-sm">Ranked in top 10% of users</p>
           </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-sky-50 text-text-muted uppercase text-[10px] font-black tracking-widest">
              <th className="px-8 py-5">Examination</th>
              <th className="px-8 py-5">Date Attempted</th>
              <th className="px-8 py-5">Performance Bar</th>
              <th className="px-8 py-5">Score</th>
              <th className="px-8 py-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50 bg-white/40">
            {history.map((h) => (
              <tr key={h.id} className="hover:bg-white transition-colors">
                <td className="px-8 py-6">
                  <p className="font-bold text-text-dark">{h.title}</p>
                  <p className="text-xs text-text-muted">Drafted by Admin</p>
                </td>
                <td className="px-8 py-6 text-text-muted text-sm flex items-center gap-2">
                  <Calendar size={14} className="text-primary" />
                  {new Date(h.submit_time || h.start_time).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 w-1/4">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${h.score >= 40 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${h.score || 0}%` }}
                    />
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`text-lg font-black ${h.score >= 40 ? 'text-green-600' : 'text-red-500'}`}>
                    {h.score ?? 'N/A'}{h.score !== null ? '%' : ''}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => navigate(`/student/results/${h.id}`)}
                    className="p-3 bg-sky-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <HistoryIcon size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="5" className="px-8 py-20 text-center text-text-muted italic bg-white/20">
                  You haven't attempted any exams yet. Start your journey today!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentHistory;
