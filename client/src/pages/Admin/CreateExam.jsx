import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Save, 
  FileSpreadsheet, 
  ChevronLeft, 
  Settings, 
  MousePointer2, 
  Layout,
  Globe,
  Lock,
  UploadCloud
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CreateExam = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Settings, 2: Questions
  const [examInfo, setExamInfo] = useState({
    title: '', description: '', duration: 60, passing_score: 40,
    start_time: '', end_time: ''
  });
  const [questions, setQuestions] = useState([]);
  const [importType, setImportType] = useState('MANUAL'); // MANUAL, EXCEL
  const { addToast } = useToast();

  const addQuestion = (type) => {
    setQuestions([...questions, { 
      type, text: '', options: type === 'MCQ' ? ['', '', '', ''] : null, 
      correct_answer: '', explanation: '', marks: 1 
    }]);
  };

  const removeQuestion = (idx) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleQChange = (idx, field, val) => {
    const newQs = [...questions];
    newQs[idx][field] = val;
    setQuestions(newQs);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/admin/exams/import', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions([...questions, ...data]);
        setImportType('MANUAL'); // Switch to manual to show preview/edit
        addToast(`${data.length} questions imported successfully!`, 'success');
      } else {
        addToast(data.error || 'Import failed', 'error');
      }
    } catch (err) {
      addToast('Error uploading file', 'error');
    }
  };

  const handleSave = async () => {
    if (!examInfo.title || questions.length === 0) return alert('Please add title and questions');

    try {
      const res = await fetch('http://localhost:5000/api/admin/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(examInfo)
      });
      const data = await res.json();
      
      if (res.ok) {
        await fetch(`http://localhost:5000/api/admin/exams/${data.id}/questions`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
          },
          body: JSON.stringify({ questions })
        });
        addToast('Exam created and published successfully!', 'success');
        navigate('/admin/exams');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/admin/exams')} className="p-4 bg-white border border-sky-100 rounded-2xl hover:bg-sky-50 shadow-sm transition-all group">
            <ChevronLeft size={20} className="text-primary group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-text-dark tracking-tight">Cofigure New Exam</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-primary' : 'bg-green-500'}`} />
              <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{step === 1 ? 'Step 1: Exam Settings' : 'Step 2: Question Builder'}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          {step === 2 && (
            <button onClick={() => setStep(1)} className="btn-neumorph px-8">Back to Settings</button>
          )}
          <button onClick={step === 1 ? () => setStep(2) : handleSave} className="btn-primary px-8 shadow-sky-200">
            {step === 1 ? 'Next: Build Questions' : 'Save & Publish Exam'}
          </button>
        </div>
      </header>

      {step === 1 ? (
        <div className="grid grid-3 gap-8">
          <div className="glass-card p-10 col-span-2 space-y-8">
            <h3 className="text-xl font-black text-text-dark flex items-center gap-2">
              <Settings className="text-primary" size={20} /> Basic Configuration
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Examination Title</label>
                <input 
                  placeholder="e.g. Advanced Data Structures" 
                  className="py-4 px-6 text-lg font-bold"
                  value={examInfo.title}
                  onChange={e => setExamInfo({...examInfo, title: e.target.value})}
                />
              </div>

              <div className="grid grid-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Duration (Min)</label>
                  <input 
                    type="number" 
                    className="py-4 px-6 font-bold"
                    value={examInfo.duration}
                    onChange={e => setExamInfo({...examInfo, duration: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Pass Score (%)</label>
                  <input 
                    type="number" 
                    className="py-4 px-6 font-bold"
                    value={examInfo.passing_score}
                    onChange={e => setExamInfo({...examInfo, passing_score: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Start Window</label>
                  <input 
                    type="datetime-local" 
                    className="py-4 px-6 font-bold"
                    value={examInfo.start_time}
                    onChange={e => setExamInfo({...examInfo, start_time: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">End Window</label>
                  <input 
                    type="datetime-local" 
                    className="py-4 px-6 font-bold"
                    value={examInfo.end_time}
                    onChange={e => setExamInfo({...examInfo, end_time: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Instructions for Students</label>
                <textarea 
                  placeholder="Tell students what to expect..." 
                  className="h-32 py-4 px-6"
                  value={examInfo.description}
                  onChange={e => setExamInfo({...examInfo, description: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-10 bg-primary/5 border-primary/20">
              <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Exam Summary</h4>
              <ul className="space-y-4">
                <li className="flex justify-between text-xs text-text-muted font-bold">
                  <span>Questions:</span>
                  <span className="text-text-dark">{questions.length} Items</span>
                </li>
                <li className="flex justify-between text-xs text-text-muted font-bold">
                  <span>Total Marks:</span>
                  <span className="text-text-dark">{questions.reduce((acc, q) => acc + (parseInt(q.marks) || 0), 0)} pts</span>
                </li>
                <li className="flex justify-between text-xs text-text-muted font-bold">
                  <span>Accessibility:</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <Globe size={12} /> Public
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass-card p-10">
              <h4 className="text-sm font-black text-text-dark uppercase tracking-widest mb-6">Security Settings</h4>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-sky-100 hover:bg-sky-50 transition-all">
                   <div className="w-5 h-5 rounded border-2 border-primary flex items-center justify-center">
                     <div className="w-2 h-2 bg-primary rounded-sm" />
                   </div>
                   <span className="text-xs font-bold text-text-dark">Shuffle Questions</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-sky-100 hover:bg-sky-50 transition-all">
                   <div className="w-5 h-5 rounded border-2 border-slate-200" />
                   <span className="text-xs font-bold text-text-dark">Browser Lockdown</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-sky-100 shadow-xl shadow-sky-50">
            <div className="flex bg-sky-50 p-1.5 rounded-2xl w-fit">
              <button 
                onClick={() => setImportType('MANUAL')}
                className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${importType === 'MANUAL' ? 'bg-white text-primary shadow-lg' : 'text-text-muted hover:text-primary'}`}
              >
                <MousePointer2 size={14} /> Manual Entry
              </button>
              <button 
                onClick={() => setImportType('EXCEL')}
                className={`px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${importType === 'EXCEL' ? 'bg-white text-primary shadow-lg' : 'text-text-muted hover:text-primary'}`}
              >
                <FileSpreadsheet size={14} /> Upload Excel
              </button>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => addQuestion('MCQ')} className="btn-neumorph px-4 text-xs font-black">+ MCQ</button>
              <button onClick={() => addQuestion('SHORT_ANSWER')} className="btn-neumorph px-4 text-xs font-black">+ Short</button>
              <button onClick={() => addQuestion('CODING')} className="btn-neumorph px-4 text-xs font-black">+ Coding</button>
            </div>
          </div>

          {importType === 'MANUAL' ? (
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="glass-card p-10 border-l-[6px] border-primary group relative animate-slide">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-sky-100">
                        {idx + 1}
                      </div>
                      <div className="badge badge-completed">{q.type}</div>
                    </div>
                    <button 
                      onClick={() => removeQuestion(idx)}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Question Content</label>
                       <textarea 
                         placeholder="What's the question?"
                         className="h-24 bg-sky-50/30 border-sky-100 focus:bg-white text-lg font-medium"
                         value={q.text}
                         onChange={e => handleQChange(idx, 'text', e.target.value)}
                       />
                    </div>

                    {q.type === 'MCQ' && (
                      <div className="grid grid-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex gap-4 items-center group/opt">
                            <span className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center font-black text-primary text-xs">{String.fromCharCode(65+oIdx)}</span>
                            <input 
                              placeholder={`Option ${oIdx+1}`}
                              className="py-3 px-5 bg-sky-50/30 border-sky-100 focus:bg-white font-medium"
                              value={opt}
                              onChange={e => {
                                const newQs = [...questions];
                                newQs[idx].options[oIdx] = e.target.value;
                                setQuestions(newQs);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-2 gap-8 pt-8 border-t border-sky-50">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Correct Identity</label>
                          <input 
                            placeholder="Enter the magic word / answer"
                            className="bg-green-50/30 border-green-100 focus:bg-white font-bold"
                            value={q.correct_answer}
                            onChange={e => handleQChange(idx, 'correct_answer', e.target.value)}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Assigned Marks</label>
                          <input 
                            type="number"
                            className="bg-indigo-50/30 border-indigo-100 focus:bg-white font-black"
                            value={q.marks}
                            onChange={e => handleQChange(idx, 'marks', e.target.value)}
                          />
                       </div>
                    </div>
                  </div>
                </div>
              ))}

              {questions.length === 0 && (
                <div className="glass-card p-24 flex flex-col items-center justify-center opacity-40">
                   <div className="p-8 bg-sky-50 rounded-[40px] mb-6">
                     <Layout size={64} className="text-primary" />
                   </div>
                   <h3 className="text-2xl font-black text-text-dark">Question Builder Is Empty</h3>
                   <p className="text-text-muted mt-2">Start adding questions using the toolbar above.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-24 flex flex-col items-center justify-center hover:border-primary border-dashed border-4 border-sky-100 transition-all group relative">
               <UploadCloud size={80} className="text-sky-200 group-hover:text-primary transition-colors mb-6" />
               <h3 className="text-2xl font-black text-text-dark">Upload Your Database</h3>
               <p className="text-text-muted mt-2 font-medium">Support (.xlsx, .csv) with predefined template structure.</p>
               
               <input 
                 type="file" 
                 accept=".xlsx, .xls, .csv" 
                 className="absolute inset-0 opacity-0 cursor-pointer" 
                 onChange={handleFileUpload}
               />
               
               <button className="btn-primary mt-10 px-10 pointer-events-none">Choose Excel File</button>
               <p className="text-[10px] mt-6 font-bold text-primary underline cursor-pointer">Download Official Template</p>
            </div>

          )}
        </div>
      )}
    </div>
  );
};

export default CreateExam;
