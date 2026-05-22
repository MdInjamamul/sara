import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const quillModules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
    ]
};

const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'link', 'color', 'background', 'align'
];

const Newsletter = () => {
    const { token } = useAuth();
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    
    // Editor State
    const [subject, setSubject] = useState('');
    const [htmlContent, setHtmlContent] = useState('');
    const [sending, setSending] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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

    const handleSendNewsletter = () => {
        if (!subject.trim() || !htmlContent.trim() || htmlContent === '<p><br></p>') {
            setToast({ message: 'Please provide both subject and content', type: 'error' });
            return;
        }

        const activeCount = subscribers.filter(s => s.status === 'subscribed').length;
        if (activeCount === 0) {
            setToast({ message: 'No active subscribers to send to', type: 'error' });
            return;
        }

        setShowConfirm(true);
    };

    const confirmAndSend = async () => {
        setShowConfirm(false);
        setSending(true);
        try {
            const res = await fetch(`${API_URL}/newsletter/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subject, htmlContent })
            });
            
            const data = await res.json();
            if (res.ok) {
                setToast({ message: data.message || 'Newsletter sent successfully!', type: 'success' });
                setSubject('');
                setHtmlContent('');
            } else {
                setToast({ message: data.message || 'Failed to send newsletter', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred while sending', type: 'error' });
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const activeSubscribers = subscribers.filter(s => s.status === 'subscribed').length;

    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Newsletter Manager</h1>
                <div className="admin-stats-badge">
                    Active Subscribers: {activeSubscribers} / {subscribers.length}
                </div>
            </div>

            {/* Compose Newsletter Section */}
            <div style={{
                background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                padding: '2rem', marginBottom: '2rem'
            }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Compose Newsletter</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email Subject *</label>
                    <input
                        type="text"
                        placeholder="Enter the subject line..."
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-sm)', outline: 'none', fontSize: '0.95rem', fontFamily: 'inherit'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email Content *</label>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <ReactQuill
                            theme="snow"
                            value={htmlContent}
                            onChange={setHtmlContent}
                            modules={quillModules}
                            formats={quillFormats}
                            placeholder="Write your newsletter..."
                            style={{ minHeight: 250 }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                        onClick={handleSendNewsletter} 
                        disabled={sending || activeSubscribers === 0}
                        className="add-product-btn"
                        style={{ minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {sending ? 'Sending...' : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                Send Newsletter
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Subscribers Table */}
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)' }}>Subscribers List</h2>
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

            {showConfirm && (
                <div className="delete-modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Send Newsletter</h3>
                        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text)' }}>
                            Are you sure you want to send this email to <strong>{activeSubscribers}</strong> active subscribers? This action cannot be undone.
                        </p>
                        <div className="delete-modal-actions">
                            <button className="admin-btn cancel-btn" onClick={() => setShowConfirm(false)} style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                                Cancel
                            </button>
                            <button className="admin-btn" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }} onClick={confirmAndSend}>
                                Confirm Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default Newsletter;
