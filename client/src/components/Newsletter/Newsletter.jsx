import { useState } from 'react';
import Toast from '../Toast/Toast';
import './Newsletter.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (res.ok) {
                setToast({ message: data.message || 'Successfully subscribed!', type: 'success' });
                setEmail('');
            } else {
                setToast({ message: data.message || 'Failed to subscribe', type: 'error' });
            }
        } catch (err) {
            setToast({ message: 'Network error. Please try again later.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="newsletter">
            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
            <div className="container">
                <div className="newsletter-content">
                    <h2>Join Our Newsletter</h2>
                    <p>
                        Subscribe to receive updates on new products, special offers, and wellness tips
                        delivered straight to your inbox.
                    </p>
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? '...' : 'Subscribe'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
