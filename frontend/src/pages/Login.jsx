import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      // Navigate to correct dashboard based on user role
      switch (user.role) {
        case 'SUPER_ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'PLACEMENT_OFFICER':
          navigate('/officer-dashboard');
          break;
        case 'COMPANY':
          navigate('/company-dashboard');
          break;
        case 'STUDENT':
        default:
          navigate('/student-dashboard');
          break;
      }
    } catch (err) {
      setError(err || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="logo-badge">CP</div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            Smart Placement ERP
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            College Placement & Career Automation Portal
          </p>
        </div>

        {/* Quick Demo Login Preset Buttons */}
        <div className="demo-credentials-box">
          <div className="demo-title">⚡ Quick Demo Logins (Click to autofill):</div>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillCredentials('admin@smartplacement.com', 'Admin@123')}
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillCredentials('officer@smartplacement.com', 'Officer@123')}
            >
              🎓 Placement Officer
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillCredentials('arjun@student.com', 'Student@123')}
            >
              👨‍🎓 Student
            </button>
            <button
              type="button"
              className="demo-chip"
              onClick={() => fillCredentials('hr@techcorp.com', 'Company@123')}
            >
              🏢 Recruiter
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '18px',
              fontWeight: '500',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. yourname@college.edu"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
            style={{ marginTop: '10px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: '600' }}>
            Register as Student or Company
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
