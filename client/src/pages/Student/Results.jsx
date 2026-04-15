import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Download, 
  Home, 
  ArrowRight,
  TrendingUp,
  Award,
  BookOpen,
  PieChart,
  HelpCircle
} from 'lucide-react';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/student/attempts/${attemptId}/report`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReport(data.attempt);
          setAnswers(data.answers);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchReport();
  }, [attemptId]);

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center animate-pulse">
       <div className="p-8 bg-sky-50 rounded-[40px] mb-6">
         <PieChart size={64} className="text-primary" />
       </div>
       <h2 className="text-2xl font-black text-text-dark">Calculating Proficiency...</h2>
    </div>
  );

  const passed = report.score >= report.passing_score;
  const grade = report.score >= 90 ? 'A+' : report.score >= 75 ? 'A' : report.score >= 60 ? 'B' : report.score >= 40 ? 'C' : 'F';
  
  const correctCount = answers.filter(a => a.is_correct).length;
  const correctnessPercent = answers.length > 0 ? Math.round((correctCount / answers.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-10 animate-fade-in pb-20">
      {/* Hero Result Section */}
      <section className="grid md:grid-cols-3 gap-8 items-stretch">
        <div className="glass-card p-12 md:col-span-2 flex flex-col justify-center items-center text-center relative overflow-hidden bg-white border-white">
          <div className={`absolute top-0 left-0 w-full h-[10px] ${passed ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`} />
          
          <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 relative ${passed ? 'bg-emerald-50 text-emerald-500 shadow-xl shadow-emerald-100' : 'bg-red-50 text-red-500 shadow-xl shadow-red-100'}`}>
            {passed ? <Award size={64} /> : <XCircle size={64} />}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center font-black text-dark text-lg">
              {grade}
            </div>
          </div>

          <h1 className="text-5xl font-black text-text-dark tracking-tight mb-4">
            {passed ? 'Exam Certification Earned!' : 'Assessment Not Cleared'}
          </h1>
          <p className="text-xl text-text-muted font-medium mb-12">
            You attempted <span className="text-text-dark font-bold underline decoration-primary/20 underline-offset-4">{report.title}</span>
          </p>

          <div className="flex flex-wrap gap-6 justify-center">
            <button onClick={() => navigate('/student')} className="btn-primary px-10 py-5 shadow-sky-200 flex items-center gap-3">
               <Home size={20} /> Dashboard
            </button>
            <button className="btn-neumorph px-10 py-5 flex items-center gap-3">
               <Download size={20} /> Result Transcript (PDF)
            </button>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-8">
           <div className="glass-card p-10 bg-gradient-to-br from-white to-sky-50 border-white text-center">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Final Cumulative Score</p>
              <h2 className="text-6xl font-black text-primary tracking-tighter">{Math.round(report.score)}</h2>
              <div className="w-full h-2 bg-white rounded-full mt-8 overflow-hidden border border-sky-100">
                <div 
                  className={`h-full transition-all duration-1000 ${passed ? 'bg-emerald-500' : 'bg-red-500'}`} 
                  style={{ width: `${Math.min(100, (report.score / report.passing_score) * 100)}%` }} 
                />
              </div>
              <p className="text-xs font-bold text-text-muted mt-4">Passing requirement: {report.passing_score} pts</p>
           </div>

           <div className="glass-card p-10 space-y-6 bg-white border-white">
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-sky-50 text-primary rounded-xl"><Trophy size={20} /></div>
                    <p className="text-sm font-bold text-text-dark">Status</p>
                 </div>
                 <span className={`text-lg font-black ${passed ? 'text-emerald-500' : 'text-red-500'}`}>
                    {passed ? 'PASSED' : 'FAILED'}
                 </span>
              </div>
              <div className="flex justify-between items-center">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-500 rounded-xl"><CheckCircle size={20} /></div>
                    <p className="text-sm font-bold text-text-dark">Correctness</p>
                 </div>
                 <span className="text-lg font-black text-emerald-500">{correctnessPercent}%</span>
              </div>
           </div>
        </div>
      </section>

      {/* Breakdown Grid */}
      <section className="space-y-8">
         <h3 className="text-2xl font-black text-text-dark flex items-center gap-3">
           <BookOpen className="text-primary" /> Comprehensive Analytics
         </h3>
         <div className="glass-card divide-y divide-sky-50 bg-white border-white overflow-hidden">
            {answers.map((ans, idx) => (
              <div key={idx} className="p-8 flex flex-col gap-6 group hover:bg-sky-50/30 transition-all">
                 <div className="flex justify-between items-start">
                    <div className="flex items-center gap-6">
                       <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${ans.is_correct ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                         {idx + 1}
                       </div>
                       <div>
                          <p className="font-bold text-text-dark text-lg">{ans.text}</p>
                          <p className="text-xs text-text-muted mt-1 uppercase tracking-widest font-black">Type: {ans.type.replace('_', ' ')} // {ans.marks_awarded} / {ans.max_marks} Marks</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${ans.is_correct ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                         {ans.is_correct ? 'Correct' : 'Incorrect'}
                       </span>
                    </div>
                 </div>

                 <div className="grid md:grid-cols-2 gap-6 ml-16">
                    <div className="p-6 rounded-2xl bg-sky-50/50 border border-sky-100">
                       <p className="text-[10px] font-black text-text-muted uppercase mb-2 tracking-widest">Your Response</p>
                       <p className="text-sm font-medium text-text-dark italic">"{ans.student_answer || 'No response recorded'}"</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-emerald-50/30 border border-emerald-100">
                       <p className="text-[10px] font-black text-emerald-600 uppercase mb-2 tracking-widest">Expected Solution</p>
                       <p className="text-sm font-medium text-emerald-700 font-bold italic">"{ans.correct_answer}"</p>
                    </div>
                 </div>

                 {ans.explanation && (
                   <div className="ml-16 flex gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100/50">
                      <HelpCircle size={18} className="text-amber-500 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Conceptual Rationale</p>
                        <p className="text-xs text-amber-700 leading-relaxed font-medium">{ans.explanation}</p>
                      </div>
                   </div>
                 )}
              </div>
            ))}
            {answers.length === 0 && (
              <div className="p-20 text-center text-text-muted">
                No question data available for this report.
              </div>
            )}
         </div>
      </section>
    </div>
  );
};

export default Results;
