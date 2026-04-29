import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff, HiOutlineHome, HiOutlineBriefcase, HiOutlineShoppingCart } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'buyer'
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      return toast.error('Please fill in all required fields');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'buyer', label: 'Buyer', icon: <HiOutlineShoppingCart size={22} /> },
    { value: 'seller', label: 'Seller', icon: <HiOutlineHome size={22} /> },
    { value: 'agent', label: 'Agent', icon: <HiOutlineBriefcase size={22} /> },
  ];

  return (
    <div className="page auth-page">
      <div className="auth-card animate-slideUp">
        <h1>Create Account</h1>
        <p className="auth-subtitle">Join DealBridge — India's #1 property marketplace</p>

        <form className="auth-form" onSubmit={handleSubmit} id="register-form">
          <div className="form-group">
            <label className="form-label">I am a</label>
            <div className="role-selector">
              {roles.map(r => (
                <button
                  key={r.value}
                  type="button"
                  className={`role-option ${form.role === r.value ? 'active' : ''}`}
                  onClick={() => setForm({ ...form, role: r.value })}
                  id={`role-${r.value}`}
                >
                  {r.icon}
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="password-field">
              <HiOutlineUser style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                style={{ paddingLeft: 38 }}
                id="register-name"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <div className="password-field">
              <HiOutlineMail style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                style={{ paddingLeft: 38 }}
                id="register-email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="password-field">
                <HiOutlineLockClosed style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ paddingLeft: 38 }}
                  id="register-password"
                  autoComplete="new-password"
                />
                <button type="button" className="password-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <div className="password-field">
                <HiOutlinePhone style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="tel"
                  className="form-input"
                  placeholder="Optional"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={{ paddingLeft: 38 }}
                  id="register-phone"
                  autoComplete="tel"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading}
            id="register-submit"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
