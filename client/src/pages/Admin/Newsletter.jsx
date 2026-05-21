import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Newsletter = () => {
    const { token } = useAuth();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchSubscribers();
    }, [token]);

    const fetchSubscribers = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/newsletter/subscribers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data.data || []);
            } else {
                setToast({ message: 'Failed to fetch subscribers', type: 'error' });
            }
        } catch (error) {
            console.error("Failed to fetch subscribers", error);
            setToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Newsletter Subscribers</h1>
                <div className="admin-stats-badge">
                    Total Subscribers: {subscribers.filter(s => s.status === 'subscribed').length}
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading subscribers...</div>
            ) : (
                <div className="admin-section">
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Email Address</th>
                                    <th>Subscription Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="empty-state">No subscribers found.</td>
                                    </tr>
                                ) : (
                                    subscribers.map((sub) => (
                                        <tr key={sub._id}>
                                            <td className="table-name" style={{ fontWeight: '500' }}>{sub.email}</td>
                                            <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(sub.createdAt)}</td>
                                            <td>
                                                <span style={{ 
                                                    backgroundColor: sub.status === 'subscribed' ? '#d1fae5' : '#fee2e2', 
                                                    color: sub.status === 'subscribed' ? '#047857' : '#b91c1c', 
                                                    padding: '4px 10px', 
                                                    borderRadius: '20px', 
                                                    fontSize: '0.8rem', 
                                                    fontWeight: '600',
                                                    textTransform: 'capitalize'
                                                }}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default Newsletter;
