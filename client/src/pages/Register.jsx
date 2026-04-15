import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, GraduationCap, ChevronRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-sky-50">
      <div className="glass-card w-full max-w-[540px] p-12 animate-slide">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-sky-200 mb-6">
            <GraduationCap className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-black text-text-dark text-center mb-2">Join ExamPro</h1>
          <p className="text-text-muted text-center">Create your account to start achieving your goals.</p>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-100 text-red-500 p-4 rounded-xl text-xs font-bold mb-8">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                <input
                  type="text"
                  required
                  className="pl-12 py-3 bg-white border-transparent focus:border-primary shadow-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Account Role</label>
              <select
                className="py-3 bg-white border-transparent focus:border-primary shadow-sm font-bold text-slate-600"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
              <input
                type="email"
                required
                className="pl-12 py-3 bg-white border-transparent focus:border-primary shadow-sm"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Create Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
              <input
                type="password"
                required
                className="pl-12 py-3 bg-white border-transparent focus:border-primary shadow-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 justify-center group text-lg mt-4 shadow-xl shadow-sky-200"
          >
            {loading ? 'Creating Account...' : (
              <>
                Create Account <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-10 text-text-muted text-sm font-medium">
          Already a member?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In instead
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
