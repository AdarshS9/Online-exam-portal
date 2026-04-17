import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Terminal,
  Save,
  Award,
  AlertCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { apiFetch } from '../../utils/api';

const ExamView = () => {
  const { id: examId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  const [examState, setExamState] = useState('LOADING'); // LOADING, INSTRUCTIONS, ACTIVE
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [attemptId, setAttemptId] = useState(null);
  const [examDetails, setExamDetails] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [visited, setVisited] = useState(new Set([0]));
  const [flagged, setFlagged] = useState(new Set());

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const data = await apiFetch(`/api/exams/${examId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setExamDetails(data);
        setExamState('INSTRUCTIONS');
      } catch (err) {
        addToast(err.message || 'Failed to load assessment details', 'error');
        navigate('/student');
      }
    };
    fetchExam();
  }, [examId, navigate, addToast]);

  const startExam = async () => {
    try {
      setExamState('LOADING');
      const data = await apiFetch(`/api/student/exams/${examId}/start`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setQuestions(data.questions);
      setAttemptId(data.attemptId);
      setTimeLeft(data.timeLeft);
      setExamState('ACTIVE');
      addToast('Examination started. Good luck!', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to start exam', 'error');
      setExamState('INSTRUCTIONS');
    }
  };

  useEffect(() => {
    let timer;
    if (examState === 'ACTIVE' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && examState === 'ACTIVE') {
      handleSubmit(true);
    }
    return () => clearInterval(timer);
  }, [timeLeft, examState]);

  useEffect(() => {
    if (examState === 'ACTIVE' && questions.length > 0) {
      setVisited(prev => new Set([...prev, currentQ]));
    }
  }, [currentQ, questions, examState]);

  const saveAnswer = async (qId, ans) => {
    setIsSaving(true);
    try {
      await apiFetch(`/api/student/attempts/${attemptId}/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ questionId: qId, studentAnswer: ans })
      });
    } catch (err) {
      console.error('Save failed:', err.message);
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  };

  const toggleFlag = (idx) => {
    setFlagged(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleSubmit = async (auto = false) => {
    if (!auto && !window.confirm('Submit your examination now?')) return;
    try {
      await apiFetch(`/api/student/attempts/${attemptId}/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      addToast('Examination submitted successfully', 'success');
      navigate(`/student/results/${attemptId}`);
    } catch (err) {
      addToast(err.message || 'Submission failed', 'error');
    }
  };

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (examState === 'LOADING') return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-light)' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-fade" style={{ width: '40px', height: '40px', border: '4px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontWeight: '600' }}>Preparing environment...</p>
      </div>
    </div>
  );

  if (examState === 'INSTRUCTIONS') return (
    <div className="app-container animate-fade" style={{ maxWidth: '600px', paddingTop: '5rem' }}>
      <div className="card-clean section-stack">
        <div style={{ width: '60px', height: '60px', background: 'var(--bg-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: 'var(--primary)' }}>
          <Award size={32} />
        </div>
        <h1 style={{ fontSize: '1.75rem', textAlign: 'center' }}>{examDetails?.title}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{examDetails?.duration} minutes • {examDetails?.question_count || 'Loading...'} Questions</p>
        
        <div style={{ background: '#FFF7ED', padding: '1.5rem', borderRadius: '12px', border: '1px solid #FFEDD5', display: 'flex', gap: '1rem' }}>
          <AlertCircle size={20} color="#EA580C" />
          <p style={{ fontSize: '0.85rem', color: '#9A3412', fontWeight: '500' }}>
            Do not refresh or switch tabs. The system monitors activity to ensure integrity.
          </p>
        </div>

        <button className="btn-emerald" style={{ width: '100%', padding: '1.25rem', borderRadius: '12px' }} onClick={startExam}>
          Start Assessment
        </button>
      </div>
    </div>
  );

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#1E293B' }}>
      {/* Top Header */}
      <header style={{ 
        padding: '0.8rem 2rem', background: 'white', borderBottom: '1px solid #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>{examDetails?.title}</h1>
          <p style={{ fontSize: '0.75rem', color: '#64748B', margin: 0 }}>{questions.length} Questions Total</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isSaving && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '600' }}>Saving...</span>}
          <div style={{ 
            padding: '0.5rem 1rem', background: timeLeft < 300 ? '#FEE2E2' : '#F1F5F9', 
            borderRadius: '8px', color: timeLeft < 300 ? '#DC2626' : '#475569',
            fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.6rem'
          }}>
            <Clock size={20} /> {formatTime(timeLeft)}
          </div>
          <button className="btn-emerald" style={{ padding: '0.6rem 2rem', borderRadius: '8px' }} onClick={() => handleSubmit()}>Submit Final</button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1, padding: '2rem', gap: '2rem' }}>
        
        {/* LEFT SIDE: Question Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div className="card-clean" style={{ padding: '2.5rem', borderRadius: '16px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div style={{ padding: '0.4rem 1rem', background: 'var(--bg-light)', color: 'var(--primary)', borderRadius: '100px', fontSize: '0.75rem', fontWeight: '800' }}>
                QUESTION {currentQ + 1}
              </div>
              <button 
                onClick={() => toggleFlag(currentQ)}
                style={{ 
                  background: flagged.has(currentQ) ? '#FFF7ED' : 'transparent', 
                  border: '1px solid #E2E8F0',
                  borderColor: flagged.has(currentQ) ? '#FB923C' : '#E2E8F0',
                  color: flagged.has(currentQ) ? '#EA580C' : '#64748B',
                  padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: flagged.has(currentQ) ? '#EA580C' : '#CBD5E1' }} />
                {flagged.has(currentQ) ? 'Flagged for Review' : 'Flag for Review'}
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', lineHeight: '1.6', fontWeight: '700', color: '#0F172A', marginBottom: '2.5rem' }}>{q.text}</h2>

            <div style={{ marginTop: 'auto' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%' }} />
                Select one option
              </p>

              {q.type === 'MCQ' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {JSON.parse(q.options || '[]').map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => { setAnswers({...answers, [q.id]: opt}); saveAnswer(q.id, opt); }}
                      style={{ 
                        width: '100%', textAlign: 'left', padding: '1.25rem 1.5rem', 
                        borderRadius: '12px', border: '2px solid',
                        borderColor: answers[q.id] === opt ? 'var(--primary)' : '#E2E8F0',
                        background: answers[q.id] === opt ? 'rgba(16, 185, 129, 0.04)' : 'transparent',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        display: 'flex', alignItems: 'center', gap: '1.25rem'
                      }}
                    >
                      <div style={{ 
                        width: '24px', height: '24px', borderRadius: '50%', border: '2px solid',
                        borderColor: answers[q.id] === opt ? 'var(--primary)' : '#CBD5E1',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: answers[q.id] === opt ? 'var(--primary)' : 'transparent',
                        color: 'white', fontWeight: '800', fontSize: '0.75rem'
                      }}>
                        {answers[q.id] === opt ? '✓' : ''}
                      </div>
                      <span style={{ fontSize: '1.05rem', fontWeight: '600', color: answers[q.id] === opt ? '#0F172A' : '#475569' }}>{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {q.type === 'SHORT_ANSWER' && (
                <textarea 
                  className="input-clean" 
                  style={{ height: '200px', fontSize: '1.1rem', padding: '1.5rem', lineHeight: '1.6', borderRadius: '16px' }}
                  placeholder="Type your answer here..."
                  value={answers[q.id] || ''}
                  onChange={e => { setAnswers({...answers, [q.id]: e.target.value}); saveAnswer(q.id, e.target.value); }}
                />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0' }}>
            <button 
              className="btn-secondary" 
              style={{ opacity: currentQ === 0 ? 0.3 : 1, minWidth: '150px' }}
              disabled={currentQ === 0}
              onClick={() => setCurrentQ(prev => prev - 1)}
            >
              <ChevronLeft size={20} /> Previous
            </button>
            <button 
              className="btn-emerald" 
              style={{ minWidth: '150px' }}
              onClick={() => currentQ === questions.length - 1 ? handleSubmit() : setCurrentQ(prev => prev + 1)}
            >
              {currentQ === questions.length - 1 ? 'Finish & Submit' : 'Next Question'} <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* RIGHT SIDE: Question Navigator */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card-clean" style={{ padding: '1.5rem', borderRadius: '16px', background: 'white', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Question Panel</h3>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748B' }}>{Object.keys(answers).length}/{questions.length} Attempted</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
              {questions.map((item, idx) => {
                let status = 'UNVISITED';
                if (currentQ === idx) status = 'CURRENT';
                else if (flagged.has(idx)) status = 'FLAGGED';
                else if (answers[item.id]) status = 'ANSWERED';
                else if (visited.has(idx)) status = 'VISITED';

                const colors = {
                  'CURRENT': { bg: 'white', text: 'var(--primary)', border: 'var(--primary)' },
                  'ANSWERED': { bg: '#10B981', text: 'white', border: '#10B981' },
                  'FLAGGED': { bg: '#F97316', text: 'white', border: '#F97316' },
                  'VISITED': { bg: '#F1F5F9', text: '#475569', border: 'transparent' },
                  'UNVISITED': { bg: '#F1F5F9', text: '#94A3B8', border: 'transparent' }
                };
                const theme = colors[status];

                return (
                  <button 
                    key={idx}
                    onClick={() => setCurrentQ(idx)}
                    style={{ 
                      aspectRatio: '1/1', borderRadius: '8px', border: '2px solid',
                      borderColor: theme.border, background: theme.bg, color: theme.text,
                      fontSize: '0.85rem', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend Section */}
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#64748B' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#10B981' }} /> Answered
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#64748B' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--primary)', background: 'white' }} /> Current
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#64748B' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F97316' }} /> Flagged
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', fontWeight: '600', color: '#64748B' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#F1F5F9' }} /> Not Visited
              </div>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ExamView;

