import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, Clock, HelpCircle, Filter, ArrowRight } from 'lucide-react';

const StudentExams = () => {
  const [exams, setExams] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/exams/published', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.ok ? await res.json() : [];
        setExams(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchExams();
  }, []);

  const filteredExams = exams.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const isCompleted = e.user_attempt_status === 'SUBMITTED';
    if (filter === 'COMPLETED') return matchesSearch && isCompleted;
    if (filter === 'PENDING') return matchesSearch && !isCompleted;
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-slide">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-dark">Available Examinations</h1>
          <p className="text-text-muted mt-1">Browse and attempt exams to test your proficiency.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search exams..." 
              className="pl-12 pr-4 py-3 bg-white border border-sky-100 rounded-xl w-64 shadow-sm focus:ring-2 focus:ring-primary/20 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white p-1 rounded-xl border border-sky-100 shadow-sm">
            {['ALL', 'PENDING', 'COMPLETED'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-sky-50'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="grid grid-3">
        {filteredExams.map((exam) => (
          <div key={exam.id} className="glass-card p-8 flex flex-col group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -translate-y-10 translate-x-10 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-all`} />
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-sky-50 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                <BookOpen size={28} />
              </div>
              <span className={`badge ${exam.user_attempt_status === 'SUBMITTED' ? 'badge-completed' : 'badge-pending'}`}>
                {exam.user_attempt_status === 'SUBMITTED' ? 'Completed' : 'Pending'}
              </span>
            </div>

            <h3 className="text-xl font-bold text-text-dark mb-2 group-hover:text-primary transition-colors">{exam.title}</h3>
            <p className="text-text-muted text-sm mb-8 line-clamp-2">{exam.description || 'No description available for this exam yet.'}</p>

            <div className="flex items-center gap-6 mt-auto text-sm font-semibold text-text-muted border-t border-sky-50 pt-6">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span>{exam.duration}m</span>
              </div>
              <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-primary" />
                <span>{exam.question_count} Qs</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(`/student/exam/${exam.id}`)}
              disabled={exam.user_attempt_status === 'SUBMITTED'}
              className={`mt-8 btn-primary justify-center gap-2 ${exam.user_attempt_status === 'SUBMITTED' ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
            >
              {exam.user_attempt_status === 'SUBMITTED' ? 'Already Attempted' : 'Start Exam'} <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="glass-card p-20 flex flex-col items-center justify-center text-center opacity-60">
           <BookOpen size={64} className="text-sky-200 mb-4" />
           <p className="text-xl font-medium text-text-dark">No exams found matching your criteria.</p>
           <button onClick={() => {setFilter('ALL'); setSearch('');}} className="mt-4 text-primary font-bold hover:underline">Clear all filters</button>
        </div>
      )}
    </div>
  );
};

export default StudentExams;
