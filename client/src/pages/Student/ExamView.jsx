import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Send, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  HelpCircle, 
  Code,
  ShieldCheck,
  AlertTriangle,
  PlayCircle,
  Terminal,
  Cpu
} from 'lucide-react';

const ExamView = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const [examState, setExamState] = useState('LOADING'); // LOADING, INSTRUCTIONS, ACTIVE, FINISHED
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/exams/${examId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (res.ok) {
          setExamDetails(data);
          setExamState('INSTRUCTIONS');
        } else {
          alert('Exam not found');
          navigate('/student');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchExam();
  }, [examId]);

  const startExam = async () => {
    try {
      setExamState('LOADING');
      const res = await fetch(`http://localhost:5000/api/student/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions);
        setAttemptId(data.attemptId);
        setTimeLeft(data.timeLeft);
        setExamState('ACTIVE');
      } else {
        alert(data.error);
        navigate('/student');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (examState === 'ACTIVE' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && examState === 'ACTIVE') {
      handleSubmit(true);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, examState]);

  // Auto-save logic
  useEffect(() => {
    if (examState !== 'ACTIVE') return;
    const saver = setInterval(() => {
      const q = questions[currentQ];
      if (q && answers[q.id]) {
        saveAnswer(q.id, answers[q.id]);
      }
    }, 5000);
    return () => clearInterval(saver);
  }, [currentQ, answers, questions, examState]);

  const saveAnswer = async (qId, ans) => {
    try {
      await fetch(`http://localhost:5000/api/student/attempts/${attemptId}/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ questionId: qId, studentAnswer: ans })
      });
    } catch (err) {
      console.error(err);
    }
  };
  const handleRunCode = async () => {
    if (!answers[q.id]) return alert('Please write some code first');
    setRunning(true);
    setOutput('Compiling and executing code in sandbox...');
    try {
      const res = await fetch(`http://localhost:5000/api/student/run-code`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ code: answers[q.id], language })
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data.error || data.output);
      } else {
        setOutput('Error: Execution failed on server.');
      }
    } catch (err) {
      setOutput('Error: Could not connect to sandbox.');
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('Ready for final submission? This action cannot be undone.')) return;
    setExamState('LOADING');
    try {
      const res = await fetch(`http://localhost:5000/api/student/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        navigate(`/student/results/${attemptId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (examState === 'LOADING') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-10 animate-pulse">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6" />
        <h2 className="text-2xl font-black text-text-dark">Synchronizing Portal...</h2>
        <p className="text-text-muted mt-2">Preparing your examination environment.</p>
      </div>
    );
  }

  if (examState === 'INSTRUCTIONS') {
    return (
      <div className="max-w-4xl mx-auto py-10 animate-fade-in">
        <div className="glass-card p-12 space-y-10 border-t-[8px] border-primary shadow-2xl shadow-sky-100">
          <div className="text-center">
            <h1 className="text-4xl font-black text-text-dark mb-4">{examDetails?.title}</h1>
            <div className="flex justify-center gap-6">
              <span className="badge badge-completed bg-sky-50 text-primary border-sky-100 font-black">
                <Clock size={12} className="inline mr-1" /> {examDetails?.duration} Minutes
              </span>
              <span className="badge badge-completed bg-indigo-50 text-indigo-500 border-indigo-100 font-black">
                <HelpCircle size={12} className="inline mr-1" /> No. Of Questions: TBA
              </span>
            </div>
          </div>

          <div className="p-10 rounded-[30px] bg-slate-50 border border-slate-100 space-y-6">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" /> Proctoring Instructions
            </h3>
            <div className="space-y-4">
              <p className="text-slate-600 font-medium leading-relaxed">{examDetails?.description || "Welcome to the online assessment. Please ensure a stable internet connection and avoid switching tabs during the examination."}</p>
              <ul className="space-y-3 pt-4">
                  {[
                    "Do not refresh the page or use back/forward buttons.",
                    "The countdown will continue even if your browser closes.",
                    "Answers are auto-saved every 3-5 seconds.",
                    "Submission is automatic when the timer reaches zero."
                  ].map((inst, i) => (
                    <li key={i} className="flex items-center gap-4 text-sm font-bold text-slate-500">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" /> {inst}
                    </li>
                  ))}
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4 items-start">
             <AlertTriangle className="text-red-500 shrink-0" />
             <p className="text-xs font-bold text-red-600 leading-relaxed uppercase tracking-wide">
               Warning: Any detected malpractice or tab switching may lead to immediate disqualification by the automated AI proctoring system.
             </p>
          </div>

          <button 
            onClick={startExam}
            className="w-full btn-primary py-6 text-xl font-black group shadow-2xl flex items-center justify-center gap-4"
          >
            I Accept & Start Exam <PlayCircle className="group-hover:scale-125 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="flex gap-10 max-w-[1600px] mx-auto h-[calc(100vh-140px)] animate-fade-in">
      <div className="flex-1 flex flex-col gap-8">
        {/* Header Bar */}
        <div className="glass-card p-6 flex justify-between items-center bg-white border-white/60 shadow-xl shadow-sky-50">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-sky-100">
               {currentQ + 1}
            </div>
            <div>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Assessment</p>
              <h4 className="text-lg font-black text-text-dark mt-1">{examDetails?.title}</h4>
            </div>
          </div>

          <div className={`p-4 rounded-2xl flex items-center gap-4 font-mono text-2xl font-black shadow-inner transition-colors ${timeLeft < 300 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-sky-50 text-primary'}`}>
             <Clock size={24} />
             {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Area */}
        <div className="glass-card flex-1 p-12 overflow-y-auto bg-white border-white">
           <div className="mb-10 flex justify-between items-center bg-sky-50 px-6 py-4 rounded-2xl border border-sky-100">
             <span className="text-xs font-black text-primary uppercase tracking-widest">{q.type} Question</span>
             <span className="text-xs font-black text-text-dark uppercase tracking-widest bg-white px-4 py-2 rounded-xl shadow-sm">{q.marks} Marks Point</span>
           </div>

           <h2 className="text-3xl font-bold text-text-dark leading-[1.3] mb-12 whitespace-pre-wrap">{q.text}</h2>

           {q.type === 'MCQ' && (
             <div className="grid grid-2 gap-6">
               {JSON.parse(q.options || '[]').map((opt, idx) => (
                 <label key={idx} className={`relative flex items-center gap-6 p-6 rounded-3xl border-2 cursor-pointer transition-all group ${answers[q.id] === opt ? 'border-primary bg-sky-50/50 shadow-xl shadow-sky-50' : 'border-slate-50 hover:border-sky-100 hover:bg-slate-50'}`}>
                   <input
                     type="radio"
                     name={`q-${q.id}`}
                     className="hidden"
                     checked={answers[q.id] === opt}
                     onChange={(e) => setAnswers({ ...answers, [q.id]: opt })}
                   />
                   <div className={`w-10 h-10 rounded-xl bg-white border-2 flex items-center justify-center font-black transition-all ${answers[q.id] === opt ? 'border-primary text-primary' : 'border-slate-200 text-slate-300'}`}>
                      {String.fromCharCode(65+idx)}
                   </div>
                   <span className={`text-lg font-bold transition-colors ${answers[q.id] === opt ? 'text-primary' : 'text-slate-600'}`}>{opt}</span>
                   {answers[q.id] === opt && <div className="absolute top-4 right-4 text-primary"><CheckCircle2 size={16} /></div>}
                 </label>
               ))}
             </div>
           )}

           {q.type === 'SHORT_ANSWER' && (
             <textarea
               className="h-48 py-8 px-10 text-xl font-bold bg-sky-50/30 border-sky-100 focus:bg-white transition-all rounded-[40px]"
               placeholder="Draft your detailed answer here..."
               value={answers[q.id] || ''}
               onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
             />
           )}

           {q.type === 'CODING' && (
              <div className="space-y-6 h-full flex flex-col min-h-[500px]">
                <div className="flex justify-between items-center mb-2">
                   <select 
                     value={language} 
                     onChange={(e) => setLanguage(e.target.value)}
                     className="bg-sky-50 text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-xl border-none outline-none ring-2 ring-sky-100"
                   >
                     <option value="javascript">JavaScript ES6</option>
                     <option value="python">Python 3.10</option>
                     <option value="java">Java 17</option>
                   </select>
                   <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Sandbox Live
                   </div>
                </div>
                
                <div className="flex-1 grid grid-cols-2 gap-6">
                   <div className="bg-slate-900 rounded-[32px] overflow-hidden flex-1 border-[10px] border-slate-900 shadow-2xl flex flex-col">
                      <div className="bg-slate-800 px-6 py-4 flex justify-between items-center">
                         <div className="flex gap-2">
                           <div className="w-3 h-3 bg-red-500 rounded-full" />
                           <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                           <div className="w-3 h-3 bg-green-500 rounded-full" />
                         </div>
                         <p className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-widest">editor.bin</p>
                      </div>
                      <textarea
                        className="flex-1 font-mono bg-slate-900 text-sky-400/90 py-10 px-10 text-lg focus:ring-0 border-none resize-none leading-relaxed"
                        placeholder="// Write your algorithm here..."
                        spellCheck="false"
                        value={answers[q.id] || ''}
                        onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      />
                   </div>

                   <div className="bg-[#121826] rounded-[32px] overflow-hidden flex-1 border-[10px] border-[#121826] shadow-2xl flex flex-col">
                      <div className="bg-slate-800/50 px-6 py-4 flex items-center gap-2">
                         <Terminal size={14} className="text-slate-400" />
                         <p className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-widest">Output Console</p>
                      </div>
                      <div className="flex-1 p-8 font-mono text-sm text-slate-300 overflow-y-auto whitespace-pre-wrap">
                        {output || 'Output will appear here after execution...'}
                        {running && <div className="mt-4 animate-pulse">|</div>}
                      </div>
                   </div>
                </div>
                
                <div className="flex gap-4">
                   <button 
                     disabled={running}
                     onClick={handleRunCode}
                     className="btn-neumorph bg-slate-100 px-8 flex items-center gap-3 hover:text-primary transition-all disabled:opacity-50"
                   >
                     <PlayCircle size={18} /> {running ? 'Executing...' : 'Run Code'}
                   </button>
                   <button className="btn-neumorph bg-slate-100 px-8 flex items-center gap-3 opacity-50"><Cpu size={18} /> Run Test Cases</button>
                </div>
              </div>
            )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center">
          <button 
             className={`btn-neumorph px-8 flex items-center gap-3 ${currentQ === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
             onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
          >
            <ChevronLeft size={20} /> Back
          </button>
          
          <div className="flex gap-4">
             <button className="p-4 bg-white border border-sky-100 rounded-2xl text-yellow-500 hover:bg-yellow-50 transition-all shadow-sm">
                <Flag size={20} />
             </button>
             {currentQ === questions.length - 1 ? (
               <button onClick={() => handleSubmit(false)} className="px-10 py-5 bg-emerald-500 text-white font-black rounded-3xl shadow-xl shadow-emerald-100 hover:bg-emerald-600 transition-all flex items-center gap-3 uppercase tracking-widest text-sm">
                 End Examination <Send size={18} />
               </button>
             ) : (
               <button 
                 className="px-10 py-5 bg-primary text-white font-black rounded-3xl shadow-xl shadow-sky-200 hover:scale-105 transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
                 onClick={() => setCurrentQ(prev => Math.min(questions.length - 1, prev + 1))}
               >
                 Next Question <ChevronRight size={18} />
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Palette Sidebar */}
      <div className="w-[380px] flex flex-col gap-8">
        <div className="glass-card p-10 flex flex-col bg-white border-white">
           <h3 className="text-xl font-black text-text-dark mb-10 border-b border-sky-50 pb-6">Examination Map</h3>
           
           <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQ(idx)}
                  className={`aspect-square rounded-2xl flex items-center justify-center font-black text-sm transition-all relative ${
                    currentQ === idx ? 'ring-[3px] ring-primary shadow-xl shadow-sky-100 z-10 scale-110' : ''
                  } ${
                    answers[questions[idx].id] ? 'bg-primary text-white' : 'bg-sky-50 text-slate-400'
                  }`}
                >
                  {idx + 1}
                  {answers[questions[idx].id] && <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
                </button>
              ))}
           </div>

           <div className="mt-12 space-y-4 pt-10 border-t border-sky-50">
              <div className="flex items-center gap-4 text-xs font-black uppercase text-text-muted">
                 <div className="w-4 h-4 rounded bg-primary" /> Answered Points
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase text-text-muted">
                 <div className="w-4 h-4 rounded bg-sky-50" /> Pending Review
              </div>
              <div className="flex items-center gap-4 text-xs font-black uppercase text-text-muted">
                 <div className="w-4 h-4 rounded border-2 border-primary" /> Active Cursor
              </div>
           </div>

           <div className="mt-auto pt-10">
              <div className="p-6 bg-yellow-50 rounded-3xl border border-yellow-100">
                <p className="text-[10px] font-black text-yellow-600 leading-relaxed uppercase tracking-widest text-center">
                  Malpractice Shield Active // System recording tab focus and hardware activity.
                </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExamView;
