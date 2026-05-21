import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Reports = () => {
    const { token } = useAuth();
    const [period, setPeriod] = useState('monthly');
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        avgOrderValue: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        cancellationRate: 0
    });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    useEffect(() => {
        fetchReports();
    }, [token, period]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/reports/orders?period=${period}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setStats(data.data.stats || {
                        totalOrders: 0,
                        totalRevenue: 0,
                        avgOrderValue: 0,
                        deliveredOrders: 0,
                        cancelledOrders: 0,
                        cancellationRate: 0
                    });
                    setOrders(data.data.orders || []);
                } else {
                    // Fallback if structure is different
                    setStats(data.summary || data.stats || data);
                    setOrders(data.orders || []);
                }
            } else {
                setToast({ message: 'Failed to fetch reports', type: 'error' });
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
            setToast({ message: 'An error occurred while fetching reports', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return { bg: '#fef3c7', text: '#b45309' };
            case 'Confirmed': return { bg: '#dbeafe', text: '#1d4ed8' };
            case 'Processing': return { bg: '#f3e8ff', text: '#7e22ce' };
            case 'Shipped': return { bg: '#cffafe', text: '#0f766e' };
            case 'Delivered': return { bg: '#d1fae5', text: '#047857' };
            case 'Cancelled': return { bg: '#fee2e2', text: '#b91c1c' };
            default: return { bg: '#f1f5f9', text: '#475569' };
        }
    };

    return (
        <AdminLayout>
            <div className="admin-header-flex">
                <h1 className="admin-title">Reports</h1>
            </div>

            <div className="admin-filters" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label style={{ fontWeight: '500' }}>Period:</label>
                    <select 
                        value={period} 
                        onChange={(e) => setPeriod(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading reports...</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalOrders || 0}</div>
                        </div>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>NPR {(stats.totalRevenue || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Avg Order Value</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>NPR {(stats.avgOrderValue || 0).toLocaleString()}</div>
                        </div>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Delivered Orders</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#047857' }}>{stats.deliveredOrders || 0}</div>
                        </div>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Cancelled Orders</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#b91c1c' }}>{stats.cancelledOrders || 0}</div>
                        </div>
                        <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Cancellation Rate</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{Number(stats.cancellationRate || 0).toFixed(1)}%</div>
                        </div>
                    </div>

                    <div className="admin-section">
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Orders ({period})</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="empty-state">No orders found for this period.</td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => {
                                            const colors = getStatusColor(order.status);
                                            return (
                                                <tr key={order._id}>
                                                    <td className="table-id" style={{ fontFamily: 'monospace' }}>#{order.orderId}</td>
                                                    <td className="table-name">{order.customerName}</td>
                                                    <td style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{formatDate(order.date)}</td>
                                                    <td>{order.itemCount}</td>
                                                    <td className="table-price" style={{ fontWeight: '600' }}>NPR {(order.total || 0).toFixed(2)}</td>
                                                    <td>
                                                        <span style={{ 
                                                            backgroundColor: colors.bg, 
                                                            color: colors.text, 
                                                            padding: '4px 10px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.8rem', 
                                                            fontWeight: '600' 
                                                        }}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default Reports;
