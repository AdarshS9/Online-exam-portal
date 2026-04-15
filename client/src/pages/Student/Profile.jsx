import { User, Mail, Shield, Camera, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../../App';
import { useToast } from '../../context/ToastContext';

const StudentProfile = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name,
    email: user?.email
  });

  const handleUpdate = (e) => {
    e.preventDefault();
    setEditing(false);
    addToast('Profile updated successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-slide">
      <header>
        <h1 className="text-3xl font-bold text-text-dark">Account Profile</h1>
        <p className="text-text-muted mt-1">Manage your personal information and preferences.</p>
      </header>

      <div className="grid grid-2">
        {/* Profile Card */}
        <div className="glass-card p-10 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-sky-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
               {user?.profile_photo ? (
                 <img src={user.profile_photo} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <User size={64} className="text-primary" />
               )}
            </div>
            <button className="absolute bottom-1 right-1 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera size={16} />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-text-dark mt-6">{user?.name}</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className="badge bg-primary/10 text-primary border border-primary/20">{user?.role}</span>
          </div>

          <div className="w-full mt-10 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50/50 border border-sky-100/50">
              <Mail className="text-primary" size={20} />
              <div>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest">Email Address</p>
                <p className="font-semibold text-text-dark">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-sky-50/50 border border-sky-100/50">
              <Shield className="text-primary" size={20} />
              <div>
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest">Account Status</p>
                <p className="font-semibold text-text-dark">Verified User</p>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Info Card */}
        <div className="glass-card p-10 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-text-dark underline decoration-sky-200 decoration-4 underline-offset-8">Account Details</h3>
            <button 
              onClick={() => setEditing(!editing)}
              className={`p-2 rounded-lg transition-all ${editing ? 'bg-red-50 text-red-500' : 'bg-sky-50 text-primary'}`}
            >
              {editing ? <X size={20} /> : <Edit2 size={20} />}
            </button>
          </div>

          <form className="space-y-6 flex-1" onSubmit={handleUpdate}>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-wider">Full Display Name</label>
              <input 
                className={`transition-all ${!editing ? 'bg-transparent border-transparent cursor-not-allowed opacity-70 p-0 text-lg font-bold' : ''}`}
                value={formData.name}
                disabled={!editing}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-wider">Contact Email</label>
              <input 
                className={`transition-all ${!editing ? 'bg-transparent border-transparent cursor-not-allowed opacity-70 p-0 text-lg font-bold' : ''}`}
                value={formData.email}
                disabled={!editing}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-text-muted uppercase tracking-wider">Current Password</label>
              <input 
                type="password"
                className={`transition-all ${!editing ? 'bg-transparent border-transparent cursor-not-allowed opacity-70 p-0 text-lg font-bold' : ''}`}
                value="********"
                disabled={!editing}
              />
            </div>

            {editing && (
              <button type="submit" className="w-full btn-primary flex justify-center items-center gap-2 mt-auto">
                <Save size={18} /> Update Profile
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
