import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast/Toast';
import './Auth.css';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });
    
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (name.trim().length < 2) {
            setToast({ message: 'Name must be at least 2 characters', type: 'error' });
            return;
        }

        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            setToast({ message: 'Please enter a valid email address', type: 'error' });
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setToast({ message: 'Phone number must be exactly 10 digits', type: 'error' });
            return;
        }

        if (password.length < 6) {
            setToast({ message: 'Password must be at least 6 characters', type: 'error' });
            return;
        }

        setLoading(true);
        
        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                login(data, data.token);
                setToast({ message: 'Registration successful!', type: 'success' });
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setToast({ message: data.message || 'Registration failed', type: 'error' });
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
                <h2>Create an Account</h2>
                <p>Join SARA to start shopping and reviewing</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            placeholder="Enter your full name"
                        />
                    </div>
                    
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
                        <label>Phone Number *</label>
                        <input 
                            type="tel" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                            required
                            placeholder="Enter 10-digit phone number"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="Create a password (min. 6 characters)"
                        />
                    </div>
                    
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Already have an account? <Link to="/login">Log in</Link>
                </div>
            </div>
            <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
        </div>
    );
};

export default Signup;
