import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Search, TrendingUp, Users, ArrowUpRight, Crown, BookOpen } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/student/leaderboard', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setLeaders(data);
      } catch (err) {
        addToast('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const filteredLeaders = leaders.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
     <div className="min-h-[60vh] flex items-center justify-center animate-pulse">
        <Trophy size={64} className="text-primary opacity-20" />
     </div>
  );

  const top3 = leaders.slice(0, 3);
  const others = filteredLeaders.slice(3);

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tight">Global Leaderboard</h1>
          <p className="text-text-muted mt-2 font-medium">Behold the top academic performers across the entire platform.</p>
        </div>
        
        <div className="flex bg-white p-2 rounded-2xl shadow-xl shadow-sky-50 border border-sky-50">
           <div className="p-4 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users size={20} /></div>
              <div>
                <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Global Participants</p>
                <p className="text-xl font-black text-text-dark">{leaders.length}</p>
              </div>
           </div>
        </div>
      </header>

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div className="flex flex-col md:flex-row gap-8 items-end justify-center py-10">
          {/* Silver */}
          {top3[1] && (
            <div className="w-full md:w-72 glass-card p-10 text-center bg-white border-white order-2 md:order-1 h-fit">
               <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-400 border-4 border-white shadow-lg">
                    {top3[1].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-slate-300 p-2 rounded-lg text-white shadow-lg shadow-slate-200">
                    <Medal size={16} fill="white" />
                  </div>
               </div>
               <h3 className="text-lg font-black text-text-dark">{top3[1].name}</h3>
               <p className="text-xs text-text-muted font-bold mt-1">{top3[1].total_score} Points Earned</p>
               <div className="mt-8 pt-8 border-t border-sky-50 flex justify-around">
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-text-muted">Rank</p>
                     <p className="text-lg font-black text-slate-400">#2</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-text-muted">Tests</p>
                     <p className="text-lg font-black text-slate-400">{top3[1].tests_completed}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Gold */}
          {top3[0] && (
            <div className="w-full md:w-80 glass-card p-12 text-center bg-gradient-to-b from-white to-yellow-50 border-yellow-100 order-1 md:order-2 shadow-2xl shadow-yellow-100/50 transform md:scale-110">
               <div className="relative inline-block mb-8">
                  <div className="w-28 h-28 rounded-full bg-yellow-100 flex items-center justify-center font-black text-4xl text-yellow-600 border-[6px] border-white shadow-xl">
                    {top3[0].avatar}
                  </div>
                  <div className="absolute -top-4 -right-4 bg-yellow-400 p-4 rounded-2xl text-white shadow-2xl shadow-yellow-200">
                    <Crown size={24} fill="white" />
                  </div>
               </div>
               <h3 className="text-2xl font-black text-text-dark">{top3[0].name}</h3>
               <p className="text-sm text-text-muted font-bold mt-1">{top3[0].total_score} Mastery Points</p>
               <div className="mt-8 pt-8 border-t border-yellow-100 flex justify-around">
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-yellow-600">Rank</p>
                     <p className="text-lg font-black text-yellow-600">#1</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-yellow-600">Tests</p>
                     <p className="text-lg font-black text-yellow-600">{top3[0].tests_completed}</p>
                  </div>
               </div>
            </div>
          )}

          {/* Bronze */}
          {top3[2] && (
            <div className="w-full md:w-72 glass-card p-10 text-center bg-white border-white order-3 h-fit">
               <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center font-black text-2xl text-orange-600 border-4 border-white shadow-lg">
                    {top3[2].avatar}
                  </div>
                  <div className="absolute -top-2 -right-2 bg-orange-400 p-2 rounded-lg text-white shadow-lg shadow-orange-100">
                    <Medal size={16} fill="white" />
                  </div>
               </div>
               <h3 className="text-lg font-black text-text-dark">{top3[2].name}</h3>
               <p className="text-xs text-text-muted font-bold mt-1">{top3[2].total_score} Points Earned</p>
               <div className="mt-8 pt-8 border-t border-sky-50 flex justify-around">
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-text-muted">Rank</p>
                     <p className="text-lg font-black text-orange-600">#3</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[9px] font-black uppercase text-text-muted">Tests</p>
                     <p className="text-lg font-black text-orange-600">{top3[2].tests_completed}</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Main Ranking Table */}
      <div className="glass-card overflow-hidden bg-white border-white shadow-xl">
        <div className="p-8 border-b border-sky-50 flex justify-between items-center bg-sky-50/10">
           <h3 className="text-lg font-black text-text-dark uppercase tracking-widest">Global Order of Merit</h3>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                placeholder="Search competitors..." 
                className="pl-12 py-3 bg-white border border-sky-50 rounded-xl text-xs font-bold w-64 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-sky-50/50 text-text-muted uppercase text-[10px] font-black tracking-widest">
              <th className="px-10 py-6">Rank Pos</th>
              <th className="px-10 py-6">Candidate Identity</th>
              <th className="px-10 py-6 text-center">Tests Cleared</th>
              <th className="px-10 py-6">Mastery Score</th>
              <th className="px-10 py-6 text-right">Performance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {others.map((u) => (
              <tr key={u.rank} className="hover:bg-sky-50/20 transition-colors group">
                <td className="px-10 py-8">
                  <span className={`text-lg font-black ${u.rank <= 10 ? 'text-primary' : 'text-slate-300'}`}>
                    #{u.rank.toString().padStart(2, '0')}
                  </span>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[18px] bg-sky-100 flex items-center justify-center font-black text-primary text-sm shadow-inner group-hover:scale-110 transition-transform">
                      {u.avatar}
                    </div>
                     <div>
                       <p className="font-black text-text-dark">{u.name}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Scholar</p>
                     </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-center font-bold text-text-dark">
                  {u.tests_completed}
                </td>
                <td className="px-10 py-8">
                   <p className="text-xl font-black text-primary">{u.total_score}</p>
                </td>
                <td className="px-10 py-8 text-right">
                  <button className="p-3 bg-white border border-sky-100 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                     <ArrowUpRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredLeaders.length === 0 && (
              <tr>
                <td colSpan="5" className="px-10 py-20 text-center text-text-muted font-bold">
                  No competitors found for this search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
