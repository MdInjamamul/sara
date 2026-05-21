import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import Toast from '../../components/Toast/Toast';
import '../../pages/AdminDashboard/AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const statusOptions = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_FLOW = { 'Pending': ['Confirmed'], 'Confirmed': ['Processing'], 'Processing': ['Shipped'], 'Shipped': ['Delivered'], 'Delivered': [], 'Cancelled': [] };
const STATUS_CHAIN = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'];

const Orders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [stats, setStats] = useState({ totalOrders: 0, pending: 0, delivered: 0, revenue: 0 });

    useEffect(() => {
        fetchOrders();
    }, [token, selectedStatus]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/orders?status=${selectedStatus}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
                
                // Calculate stats only when showing 'all'
                if (selectedStatus === 'all') {
                    const totalRev = data.orders.reduce((sum, order) => sum + (order.orderStatus !== 'Cancelled' ? order.totalPrice : 0), 0);
                    const pendingCount = data.orders.filter(o => o.orderStatus === 'Pending').length;
                    const deliveredCount = data.orders.filter(o => o.orderStatus === 'Delivered').length;
                    
                    setStats({
                        totalOrders: data.totalOrders,
                        pending: pendingCount,
                        delivered: deliveredCount,
                        revenue: totalRev
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch orders", error);
            setToast({ message: 'Failed to load orders', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubmit = async () => {
        if (!cancelReason.trim()) {
            setToast({ message: 'Cancel reason is mandatory', type: 'error' });
            return;
        }
        try {
            const res = await fetch(`${API_URL}/orders/${cancelModalOpen._id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: 'Cancelled', cancelReason })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o._id === cancelModalOpen._id ? updatedOrder : o));
                setToast({ message: 'Order cancelled successfully', type: 'success' });
                
                if (selectedOrder && selectedOrder._id === cancelModalOpen._id) {
                    setSelectedOrder(updatedOrder);
                }
                setCancelModalOpen(null);
                setCancelReason('');
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to cancel order', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
                setToast({ message: 'Order status updated successfully', type: 'success' });
                
                // Update selected order if it's currently open
                if (selectedOrder && selectedOrder._id === orderId) {
                    setSelectedOrder(updatedOrder);
                }
            } else {
                const data = await res.json();
                setToast({ message: data.message || 'Failed to update status', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
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
                <h1 className="admin-title">Manage Orders</h1>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Orders</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stats.totalOrders}</div>
                </div>
                <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Pending</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#b45309' }}>{stats.pending}</div>
                </div>
                <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Delivered</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#047857' }}>{stats.delivered}</div>
                </div>
                <div style={{ background: 'var(--color-bg-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Revenue</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>NPR {stats.revenue.toLocaleString()}</div>
                </div>
            </div>

            <div className="admin-section">
                <div className="admin-filters">
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                        <button 
                            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: selectedStatus === 'all' ? 'var(--color-primary)' : 'transparent', color: selectedStatus === 'all' ? 'white' : 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
                            onClick={() => setSelectedStatus('all')}
                        >All</button>
                        {statusOptions.map(status => (
                            <button 
                                key={status}
                                style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--color-border)', background: selectedStatus === status ? 'var(--color-primary)' : 'transparent', color: selectedStatus === status ? 'white' : 'inherit', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                onClick={() => setSelectedStatus(status)}
                            >{status}</button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading orders...</div>
                ) : (
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-state">No orders found matching the criteria.</td>
                                    </tr>
                                ) : (
                                    orders.map((order) => {
                                        const colors = getStatusColor(order.orderStatus);
                                        return (
                                            <tr key={order._id}>
                                                <td className="table-id" style={{ fontFamily: 'monospace' }}>#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                                                <td className="table-name">{order.user?.name || 'Unknown'}</td>
                                                <td style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{formatDate(order.createdAt)}</td>
                                                <td>{order.orderItems.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                                <td className="table-price" style={{ fontWeight: '600' }}>NPR {order.totalPrice.toFixed(2)}</td>
                                                <td>
                                                    <span style={{ 
                                                        backgroundColor: colors.bg, 
                                                        color: colors.text, 
                                                        padding: '4px 10px', 
                                                        borderRadius: '20px', 
                                                        fontSize: '0.8rem', 
                                                        fontWeight: '600' 
                                                    }}>
                                                        {order.orderStatus}
                                                    </span>
                                                </td>
                                                <td className="table-actions" style={{ gap: '0.5rem', display: 'flex', alignItems: 'center' }}>
                                                    {order.orderStatus === 'Cancelled' ? (
                                                        <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: '500', marginRight: '0.5rem' }}>
                                                            Cancelled
                                                        </span>
                                                    ) : (
                                                        <select 
                                                            value={order.orderStatus} 
                                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                            style={{ padding: '0.3rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                                                        >
                                                            {STATUS_CHAIN.includes(order.orderStatus) 
                                                                ? STATUS_CHAIN.slice(STATUS_CHAIN.indexOf(order.orderStatus)).map(opt => <option key={opt} value={opt}>{opt}</option>)
                                                                : <option value={order.orderStatus}>{order.orderStatus}</option>
                                                            }
                                                        </select>
                                                    )}
                                                    <button className="admin-btn edit-btn" onClick={() => setSelectedOrder(order)}>View</button>
                                                    {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && (
                                                        <button className="admin-btn delete-btn" onClick={() => setCancelModalOpen(order)}>Cancel Order</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="delete-modal-overlay" style={{ zIndex: 1000 }} onClick={() => setSelectedOrder(null)}>
                    <div className="delete-modal-content" style={{ maxWidth: '800px', width: '90%', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
                            <h2 style={{ margin: 0 }}>Order #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()}</h2>
                            <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Customer Details</h4>
                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{selectedOrder.user?.name}</p>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{selectedOrder.user?.email}</p>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{selectedOrder.user?.phone}</p>
                            </div>
                            <div>
                                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Shipping Address</h4>
                                <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{selectedOrder.shippingAddress.fullName}</p>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress.street}</p>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem' }}>{selectedOrder.shippingAddress.phone}</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.85rem' }}>Order Items</h4>
                            <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                                {selectedOrder.orderItems.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: idx !== selectedOrder.orderItems.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                        <img src={item.image || '/assets/images/placeholder.png'} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{item.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Qty: {item.quantity} × NPR {item.price.toFixed(2)}</p>
                                        </div>
                                        <div style={{ fontWeight: '600' }}>NPR {(item.quantity * item.price).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Subtotal:</span>
                                    <span>NPR {selectedOrder.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span>Shipping:</span>
                                    <span>NPR {selectedOrder.shippingPrice.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                    <span>Total:</span>
                                    <span>NPR {selectedOrder.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>

                        {selectedOrder.orderNote && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#475569' }}>Customer Note:</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem' }}>{selectedOrder.orderNote}</p>
                            </div>
                        )}

                        {selectedOrder.cancelReason && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b91c1c' }}>Cancellation Reason:</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b' }}>{selectedOrder.cancelReason}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancel Modal */}
            {cancelModalOpen && (
                <div className="delete-modal-overlay" style={{ zIndex: 1000 }} onClick={() => { setCancelModalOpen(null); setCancelReason(''); }}>
                    <div className="delete-modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1rem' }}>Cancel Order</h3>
                        <p style={{ marginBottom: '1rem' }}>Please provide a reason for cancelling this order:</p>
                        <textarea 
                            value={cancelReason}
                            onChange={e => setCancelReason(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', minHeight: '80px', marginBottom: '1rem', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            placeholder="Reason for cancellation..."
                        />
                        <div className="delete-modal-actions">
                            <button className="admin-btn cancel-btn" onClick={() => { setCancelModalOpen(null); setCancelReason(''); }}>Go Back</button>
                            <button className="admin-btn delete-btn" onClick={handleCancelSubmit}>Confirm Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </AdminLayout>
    );
};

export default Orders;
