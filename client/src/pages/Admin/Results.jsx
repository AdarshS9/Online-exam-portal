import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BarChart, 
  Search, 
  Download, 
  User, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const AdminResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/attempts', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) setResults(data);
      } catch (err) {
        addToast('Failed to load reports', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const avgScore = results.length > 0 ? (results.reduce((acc, curr) => acc + curr.score, 0) / results.length).toFixed(1) : 0;
  const passRate = results.length > 0 ? ((results.filter(r => r.score >= r.passing_score).length / results.length) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-fade-in pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-text-dark tracking-tight">Examination Reports</h1>
          <p className="text-text-muted mt-2 font-medium">Detailed candidate performance and per-question analytics.</p>
        </div>
        <div className="flex gap-4">
           <button className="btn-neumorph px-8 flex items-center gap-2"><Download size={18} /> Export Bulk PDF</button>
           <button className="btn-primary px-8 shadow-sky-200">Generate Insights</button>
        </div>
      </header>

      {/* Analytics Overview */}
      <div className="grid md:grid-cols-3 gap-8">
         <div className="glass-card p-10 bg-white border-white flex items-center gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-sky-50 text-primary flex items-center justify-center shadow-inner">
               <TrendingUp size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Average Platform Score</p>
               <h3 className="text-3xl font-black text-text-dark">{avgScore}%</h3>
            </div>
         </div>
         <div className="glass-card p-10 bg-white border-white flex items-center gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
               <Award size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Global Pass Rate</p>
               <h3 className="text-3xl font-black text-text-dark">{passRate}%</h3>
            </div>
         </div>
         <div className="glass-card p-10 bg-white border-white flex items-center gap-8">
            <div className="w-16 h-16 rounded-[24px] bg-purple-50 text-purple-600 flex items-center justify-center shadow-inner">
               <Users size={32} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase text-text-muted tracking-widest">Total Submissions</p>
               <h3 className="text-3xl font-black text-text-dark">{results.length}</h3>
            </div>
         </div>
      </div>

      {/* Main Results Table */}
      <div className="glass-card bg-white border-white overflow-hidden shadow-2xl shadow-sky-100/50">
         <div className="p-8 border-b border-sky-50 flex justify-between items-center bg-sky-50/10">
            <h3 className="text-lg font-black text-text-dark uppercase tracking-widest">Candidate Transcripts</h3>
            <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
               <input 
                 placeholder="Filter by name or exam title..." 
                 className="pl-12 py-3 bg-white border border-sky-50 rounded-xl text-xs font-bold w-64 shadow-sm"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-sky-50/50 text-text-muted uppercase text-[10px] font-black tracking-widest">
                  <th className="px-10 py-6">Candidate</th>
                  <th className="px-10 py-6">Examination</th>
                  <th className="px-10 py-6">Status</th>
                  <th className="px-10 py-6">Score</th>
                  <th className="px-10 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-50">
                {filteredResults.map((r) => {
                  const passed = r.score >= r.passing_score;
                  return (
                    <tr key={r.id} className="hover:bg-sky-50/20 transition-all group">
                      <td className="px-10 py-8">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-400 flex items-center justify-center font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                               {r.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                               <p className="font-black text-text-dark">{r.name}</p>
                               <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{r.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8">
                         <p className="font-bold text-text-dark">{r.exam_title}</p>
                         <p className="text-[10px] text-text-muted font-bold">{new Date(r.submit_time).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-8">
                         {passed ? (
                           <div className="flex items-center gap-2 text-emerald-500">
                             <CheckCircle2 size={16} />
                             <span className="text-sm font-black uppercase tracking-widest">Passed</span>
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-red-500">
                             <XCircle size={16} />
                             <span className="text-sm font-black uppercase tracking-widest">Failed</span>
                           </div>
                         )}
                      </td>
                      <td className="px-10 py-8">
                         <div className="flex flex-col gap-2 w-32">
                            <p className={`text-xl font-black ${passed ? 'text-emerald-500' : 'text-red-500'}`}>{r.score}</p>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                               <div className={`h-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${Math.min(100, (r.score / (r.passing_score || 100)) * 100)}%` }} />
                            </div>
                         </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                         <button className="p-4 bg-sky-50/50 text-primary rounded-2xl hover:bg-primary hover:text-white transition-all group-hover:shadow-lg shadow-sky-100 flex items-center gap-2 ml-auto font-black text-[10px] uppercase tracking-widest">
                            Report <ChevronRight size={14} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AdminResults;
