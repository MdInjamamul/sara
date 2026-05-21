import { useState } from 'react';
import { Link } from 'react-router-dom';
import Toast from '../../components/Toast/Toast';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setToast({ message: 'Password reset link has been sent to your email (via SMTP).', type: 'success' });
                setEmail('');
            } else {
                setToast({ message: data.message || 'Failed to send reset link', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Server error. Please try again.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="Enter your registered email"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Sending Link...' : 'Send Reset Link'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Remembered your password? <Link to="/login">Log in</Link>
                </div>
            </div>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
        </div>
    );
};

export default ForgotPassword;
