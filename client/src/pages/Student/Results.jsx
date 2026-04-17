import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Download, 
  Home, 
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Check,
  X,
  FileText
} from 'lucide-react';
import { apiFetch } from '../../utils/api';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const certificateRef = useRef(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await apiFetch(`/api/student/attempts/${attemptId}/report`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setReport(data.attempt);
        setAnswers(data.answers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [attemptId]);

  if (loading) return <div className="app-container" style={{ textAlign: 'center', paddingTop: '10rem' }}><h2>Generating Report...</h2></div>;
  if (!report) return <div className="app-container"><h2>Report not found</h2></div>;

  const totalQuestions = answers.length;
  const correctAnswersCount = answers.filter(a => a.is_correct).length;
  const wrongAnswersCount = totalQuestions - correctAnswersCount;
  const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;
  
  const passed = scorePercentage >= (report.passing_score || 50);
  const student = JSON.parse(localStorage.getItem('user'));

  const downloadCertificate = async () => {
    const element = document.getElementById('certificate');
    if (!element) return;
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`certificate_${(student?.name || 'student').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('Certificate generation failed:', err);
    }
  };

  return (
    <div className="app-container animate-fade" style={{ maxWidth: '800px', paddingBottom: '5rem' }}>
      
      {/* Certificate UI Wrapper for Capture */}
      <div id="certificate" style={{ background: 'white', padding: '2rem' }}>
        <section className="section-stack" style={{ textAlign: 'center', padding: '4rem 0', border: '15px solid var(--bg-light)', borderRadius: '24px' }}>
          <div style={{ marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Official Certificate of Achievement
          </div>
          
          <div style={{ 
            width: '160px', height: '160px', borderRadius: '50%', 
            background: passed ? 'rgba(16, 185, 129, 0.05)' : '#FEE2E2',
            border: `8px solid ${passed ? '#10B981' : '#DC2626'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', position: 'relative',
            boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: passed ? '#10B981' : '#DC2626' }}>{scorePercentage}%</h1>
            <div style={{ 
              position: 'absolute', bottom: '-15px', background: passed ? '#10B981' : '#DC2626',
              color: 'white', padding: '0.5rem 1.5rem', borderRadius: '100px', fontSize: '0.85rem',
              fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
            }}>
              {passed ? 'Passed' : 'Failed'}
            </div>
          </div>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>This is to certify that</p>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--text-main)', marginBottom: '1rem' }}>{student?.name || 'Valued Student'}</h2>
          
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
            Has successfully completed the assessment for
          </p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '2rem' }}>{report.exam_title}</h3>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem', maxWidth: '400px', margin: '2rem auto 0' }}>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Issue Date</p>
              <p style={{ fontWeight: '700' }}>{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Certificate ID</p>
              <p style={{ fontWeight: '700' }}>#{attemptId.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </section>
      </div>

      {/* Action Buttons (Excluded from capture) */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <button className="btn-emerald" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px' }} onClick={() => navigate('/student')}>
          <Home size={18} /> Dashboard
        </button>
        {passed && (
          <button className="btn-secondary" style={{ padding: '0.8rem 2.5rem', borderRadius: '12px' }} onClick={downloadCertificate}>
            <Download size={18} /> Download Certificate
          </button>
        )}
      </div>

      {/* Numerical Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
        <div className="card-clean" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ color: '#10B981', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><Check size={20} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{correctAnswersCount}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct</div>
        </div>
        <div className="card-clean" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ color: '#DC2626', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><X size={20} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{wrongAnswersCount}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Wrong</div>
        </div>
        <div className="card-clean" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <div style={{ color: 'var(--primary)', display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}><FileText size={20} /></div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)' }}>{totalQuestions}</div>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Questions</div>
        </div>
      </div>

      {/* Question Breakdown */}
      <section className="section-stack">
        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: '800' }}>
          <Zap size={24} style={{ color: 'var(--primary)' }} /> Performance Review
        </h2>
        
        <div className="section-stack">
          {answers.map((ans, i) => (
            <div key={i} className="card-clean" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <div 
                style={{ padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: expanded[i] ? 'var(--bg-light)' : 'transparent' }}
                onClick={() => setExpanded({...expanded, [i]: !expanded[i]})}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ 
                    width: '28px', height: '28px', borderRadius: '6px', 
                    background: ans.is_correct ? '#10B981' : '#DC2626',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white'
                  }}>
                    {ans.is_correct ? <Check size={16} strokeWidth={3} /> : <X size={16} strokeWidth={3} />}
                  </div>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Question {i + 1}</span>
                </div>
                {expanded[i] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>

              {expanded[i] && (
                <div style={{ padding: '2rem', borderTop: '1px solid var(--border-color)', background: 'white' }}>
                  <div className="section-stack">
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.6' }}>{ans.text}</p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div style={{ background: 'var(--bg-light)', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Your Answer</p>
                        <p style={{ fontSize: '0.95rem', color: ans.is_correct ? '#10B981' : '#DC2626', fontWeight: '700' }}>{ans.student_answer || '(No attempt)'}</p>
                      </div>
                      <div style={{ background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                        <p style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Correct Answer</p>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: '700' }}>{ans.correct_answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Results;


