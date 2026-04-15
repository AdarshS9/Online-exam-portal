import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/Admin/Dashboard';
import ManageExams from './pages/Admin/ManageExams';
import CreateExam from './pages/Admin/CreateExam';
import AdminResults from './pages/Admin/Results';
import StudentDashboard from './pages/Student/Dashboard';
import StudentExams from './pages/Student/Exams';
import StudentHistory from './pages/Student/History';
import StudentProfile from './pages/Student/Profile';
import Leaderboard from './pages/Student/Leaderboard';
import ExamView from './pages/Student/ExamView';
import Results from './pages/Student/Results';
import Sidebar from './components/Sidebar';
import StudentManagement from './pages/Admin/StudentManagement';


const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50">
       <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} />;
  return children;
};

const AppContent = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [loading, setLoading] = useState(false);

  const login = (userData) => {
    setUser(userData.user);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData.user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/admin/*" element={
            <ProtectedRoute role="ADMIN">
              <div className="flex bg-sky-50/30 min-h-screen">
                <Sidebar role="ADMIN" />
                <main className="main-content w-full">
                  <Routes>
                    <Route path="/" element={<AdminDashboard />} />
                    <Route path="/exams" element={<ManageExams />} />
                    <Route path="/exams/create" element={<CreateExam />} />
                    <Route path="/reports" element={<AdminResults />} />
                    <Route path="/students" element={<StudentManagement />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/student/*" element={
            <ProtectedRoute role="STUDENT">
              <div className="flex bg-sky-50/30 min-h-screen">
                <Sidebar role="STUDENT" />
                <main className="main-content w-full">
                  <Routes>
                    <Route path="/" element={<StudentDashboard />} />
                    <Route path="/exams" element={<StudentExams />} />
                    <Route path="/history" element={<StudentHistory />} />
                    <Route path="/profile" element={<StudentProfile />} />
                    <Route path="/leaderboard" element={<Leaderboard />} />
                    <Route path="/exam/:id" element={<ExamView />} />
                    <Route path="/results/:attemptId" element={<Results />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />

          <Route path="/" element={
            user ? (
              <Navigate to={user.role === 'ADMIN' ? '/admin' : '/student'} />
            ) : (
              <Navigate to="/login" />
            )
          } />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
