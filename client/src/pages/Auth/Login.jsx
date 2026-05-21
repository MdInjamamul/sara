import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast/Toast';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                login(data, data.token);
                setToast({ message: 'Login successful!', type: 'success' });
                setTimeout(() => {
                    navigate(data.role === 'admin' ? '/admin/dashboard' : '/');
                }, 1000);
            } else {
                setToast({ message: data.message || 'Login failed', type: 'error' });
                setLoading(false);
            }
        } catch (error) {
            setToast({ message: 'Server error. Please try again.', type: 'error' });
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Welcome Back</h2>
                <p>Log in to access your account</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <label>Password</label>
                            <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>Forgot Password?</Link>
                        </div>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>
            </div>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
        </div>
    );
};

export default Login;
