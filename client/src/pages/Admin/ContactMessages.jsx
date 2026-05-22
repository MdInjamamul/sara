import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ContactMessages = () => {
    const { token } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [stats, setStats] = useState({ total: 0, new: 0, read: 0, resolved: 0 });

    // Debounced fetch on filter/search changes
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchMessages();
        }, searchQuery ? 300 : 0);
        return () => clearTimeout(timer);
    }, [token, statusFilter, searchQuery]);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/contact?status=${statusFilter}&search=${searchQuery}`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (res.ok) {
                const result = await res.json();
                setMessages(result.data || []);
                if (result.stats) setStats(result.stats);
            } else {
                setToast({ message: 'Failed to load messages', type: 'error' });
            }
        } catch (error) {
            console.error('Failed to fetch contact messages', error);
            setToast({ message: 'An error occurred while fetching messages', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (messageId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/contact/${messageId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                setMessages(prev =>
                    prev.map(msg => msg._id === messageId ? { ...msg, status: newStatus } : msg)
                );
                setStats(prev => {
                    const old = messages.find(m => m._id === messageId);
                    if (!old || old.status === newStatus) return prev;
                    return {
                        ...prev,
                        [old.status]: Math.max(0, prev[old.status] - 1),
                        [newStatus]: prev[newStatus] + 1
                    };
                });
                setToast({ message: `Status updated to ${newStatus}`, type: 'success' });
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to update status', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred while updating status', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`${API_URL}/contact/${deleteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const deleted = messages.find(m => m._id === deleteId);
                setMessages(prev => prev.filter(msg => msg._id !== deleteId));
                if (deleted) {
                    setStats(prev => ({
                        ...prev,
                        total: Math.max(0, prev.total - 1),
                        [deleted.status]: Math.max(0, prev[deleted.status] - 1)
                    }));
                }
                setDeleteId(null);
                setToast({ message: 'Message deleted successfully', type: 'success' });
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to delete message', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred while deleting', type: 'error' });
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const statusBadgeStyle = (status) => {
        const colors = {
            new: { bg: '#3b82f6', text: '#ffffff' },
            read: { bg: '#f59e0b', text: '#ffffff' },
            resolved: { bg: '#10b981', text: '#ffffff' }
        };
        const c = colors[status] || colors.new;
        return {
            backgroundColor: c.bg,
            color: c.text,
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'capitalize',
            display: 'inline-block'
        };
    };

    const filterPills = ['all', 'new', 'read', 'resolved'];

    const expandedMessage = messages.find(m => m._id === expandedId);

    return (
        <AdminLayout>
            {/* Header */}
            <div className="admin-header-flex">
                <h1 className="admin-title">Contact Enquiries</h1>
                {stats.new > 0 && (
                    <span style={{
                        backgroundColor: '#3b82f6',
                        color: '#fff',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        🔵 {stats.new} New
                    </span>
                )}
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                {[
                    { label: 'Total Messages', value: stats.total, icon: '📩', color: 'var(--color-primary)' },
                    { label: 'New', value: stats.new, icon: '🔵', color: '#3b82f6' },
                    { label: 'Read', value: stats.read, icon: '📖', color: '#f59e0b' },
                    { label: 'Resolved', value: stats.resolved, icon: '✅', color: '#10b981' }
                ].map(card => (
                    <div key={card.label} style={{
                        backgroundColor: 'var(--color-bg-light)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        textAlign: 'center',
                        transition: 'box-shadow 0.2s ease',
                    }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{card.icon}</div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: card.color }}>{card.value}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500, marginTop: '0.25rem' }}>{card.label}</div>
                    </div>
                ))}
            </div>

            {/* Filter Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {filterPills.map(pill => (
                        <button
                            key={pill}
                            onClick={() => setStatusFilter(pill)}
                            style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                border: statusFilter === pill ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                backgroundColor: statusFilter === pill ? 'var(--color-primary)' : 'var(--color-bg-light)',
                                color: statusFilter === pill ? '#fff' : 'var(--color-text)',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {pill}
                        </button>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        flex: '1',
                        minWidth: '220px',
                        fontSize: '0.9rem',
                        fontFamily: 'var(--font-body)'
                    }}
                />
            </div>

            {/* Messages Table */}
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Loading messages...
                </div>
            ) : (
                <div style={{ overflowX: 'auto', backgroundColor: 'var(--color-white, #fff)', borderRadius: 'var(--radius-lg, 12px)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-sm)' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">
                                        <p>No messages found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                messages.map(msg => (
                                    <tr key={msg._id}>
                                        <td className="table-name">{msg.name}</td>
                                        <td style={{ fontSize: '0.9rem' }}>{msg.email}</td>
                                        <td style={{ fontSize: '0.9rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {msg.subject}
                                        </td>
                                        <td style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                                            {formatDate(msg.createdAt)}
                                        </td>
                                        <td>
                                            <span style={statusBadgeStyle(msg.status)}>{msg.status}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <button
                                                    className="admin-btn edit-btn"
                                                    onClick={() => setExpandedId(msg._id)}
                                                >
                                                    View
                                                </button>
                                                <select
                                                    value={msg.status}
                                                    onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                                                    style={{
                                                        padding: '5px 8px',
                                                        borderRadius: 'var(--radius-sm)',
                                                        border: '1px solid var(--color-border)',
                                                        fontSize: '0.8rem',
                                                        cursor: 'pointer',
                                                        backgroundColor: 'var(--color-bg-light)',
                                                        fontFamily: 'var(--font-body)'
                                                    }}
                                                >
                                                    <option value="new">New</option>
                                                    <option value="read">Read</option>
                                                    <option value="resolved">Resolved</option>
                                                </select>
                                                <button
                                                    className="admin-btn delete-btn"
                                                    onClick={() => setDeleteId(msg._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Message Detail Modal */}
            {expandedMessage && (
                <div
                    className="delete-modal-overlay"
                    onClick={() => setExpandedId(null)}
                >
                    <div
                        className="delete-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '600px', textAlign: 'left', position: 'relative' }}
                    >
                        {/* Close button */}
                        <button
                            onClick={() => setExpandedId(null)}
                            style={{
                                position: 'absolute',
                                top: '12px',
                                right: '14px',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.4rem',
                                cursor: 'pointer',
                                color: 'var(--color-text-muted)',
                                lineHeight: 1,
                                padding: '4px'
                            }}
                            aria-label="Close"
                        >
                            ✕
                        </button>

                        <h3 style={{ marginTop: 0, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)', color: 'var(--color-text)', paddingRight: '2rem' }}>
                            Message Details
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 1.5rem', marginBottom: '1.25rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Name</div>
                                <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{expandedMessage.name}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Email</div>
                                <a href={`mailto:${expandedMessage.email}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                                    {expandedMessage.email}
                                </a>
                            </div>
                            {expandedMessage.phone && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Phone</div>
                                    <a href={`tel:${expandedMessage.phone}`} style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
                                        {expandedMessage.phone}
                                    </a>
                                </div>
                            )}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Date</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>{formatDate(expandedMessage.createdAt)}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Subject</div>
                                <div style={{ fontWeight: 600, color: 'var(--color-text)', fontSize: '1rem' }}>{expandedMessage.subject}</div>
                            </div>
                            <span style={{ ...statusBadgeStyle(expandedMessage.status), marginLeft: 'auto' }}>
                                {expandedMessage.status}
                            </span>
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Message</div>
                            <div style={{
                                backgroundColor: 'var(--color-bg-light)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                whiteSpace: 'pre-wrap',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                color: 'var(--color-text)',
                                border: '1px solid var(--color-border)',
                                maxHeight: '250px',
                                overflowY: 'auto'
                            }}>
                                {expandedMessage.message}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="delete-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="delete-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem', color: '#b91c1c' }}>Delete Message</h3>
                        <p style={{ marginBottom: '1.5rem' }}>
                            Are you sure you want to delete this message? This action cannot be undone.
                        </p>
                        <div className="delete-modal-actions">
                            <button className="admin-btn cancel-btn" onClick={() => setDeleteId(null)} style={{ backgroundColor: 'var(--color-bg-light)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
                                Cancel
                            </button>
                            <button className="admin-btn delete-btn" onClick={handleDelete}>
                                Confirm Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default ContactMessages;
