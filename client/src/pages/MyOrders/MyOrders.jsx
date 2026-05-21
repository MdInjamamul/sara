import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';
import './MyOrders.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const nepalData = {
    "Koshi Province": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    "Madhesh Province": ["Bara", "Dhanusha", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    "Bagmati Province": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    "Gandaki Province": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahun"],
    "Lumbini Province": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Eastern Rukum", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rupandehi"],
    "Karnali Province": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Salyan", "Surkhet", "Western Rukum"],
    "Sudurpashchim Province": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

const MyOrders = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    // Modals state
    const [cancelModalOrder, setCancelModalOrder] = useState(null);
    const [editModalOrder, setEditModalOrder] = useState(null);
    const [editForm, setEditForm] = useState({
        fullName: '', phone: '', street: '', city: '', state: '', zipCode: '', country: 'Nepal', orderNote: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/my`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrders(data);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchOrders();
        }
    }, [token]);

    const toggleExpand = (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
        } else {
            setExpandedOrderId(orderId);
        }
    };

    const handleCancelClick = (order) => setCancelModalOrder(order);
    const closeCancelModal = () => setCancelModalOrder(null);

    const confirmCancel = async () => {
        if (!cancelModalOrder) return;
        const orderId = cancelModalOrder._id;
        
        setCancellingId(orderId);
        closeCancelModal();
        
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // Update local state
                setOrders(orders.map(o => o._id === orderId ? data : o));
                setToast({ message: 'Order cancelled successfully', type: 'success' });
            } else {
                setToast({ message: data.message || 'Failed to cancel order', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setCancellingId(null);
        }
    };

    const handleEditClick = (order) => {
        setEditForm({
            fullName: order.shippingAddress.fullName || '',
            phone: order.shippingAddress.phone || '',
            street: order.shippingAddress.street || '',
            city: order.shippingAddress.city || '',
            state: order.shippingAddress.state || '',
            zipCode: order.shippingAddress.zipCode || '',
            country: order.shippingAddress.country || 'Nepal',
            orderNote: order.orderNote || ''
        });
        setEditModalOrder(order);
    };

    const closeEditModal = () => setEditModalOrder(null);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEditStateChange = (e) => {
        const selectedState = e.target.value;
        setEditForm(prev => ({ ...prev, state: selectedState, city: '' }));
    };

    const saveEdit = async (e) => {
        e.preventDefault();
        
        if (!editForm.fullName || !editForm.phone || !editForm.street || !editForm.city || !editForm.state) {
            setToast({ message: 'Please fill in all required fields', type: 'error' });
            return;
        }

        setIsSaving(true);
        const orderId = editModalOrder._id;

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    shippingAddress: {
                        fullName: editForm.fullName,
                        phone: editForm.phone,
                        street: editForm.street,
                        city: editForm.city,
                        state: editForm.state,
                        zipCode: editForm.zipCode,
                        country: editForm.country
                    },
                    orderNote: editForm.orderNote
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setOrders(orders.map(o => o._id === orderId ? data : o));
                setToast({ message: 'Order details updated successfully', type: 'success' });
                closeEditModal();
            } else {
                setToast({ message: data.message || 'Failed to update order', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <div className="my-orders-page">
                <Navbar />
                <div style={{ textAlign: 'center', padding: '4rem' }}>Loading your orders...</div>
            </div>
        );
    }

    return (
        <div className="my-orders-page">
            <Navbar />
            
            <main className="my-orders-container">
                <h1 className="my-orders-title">My Orders</h1>
                
                {orders.length === 0 ? (
                    <div className="empty-orders">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <path d="M3 6h18"></path>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <h2>No orders yet</h2>
                        <p>You haven't placed any orders with us yet.</p>
                        <Link to="/products" className="btn-primary">Start Shopping</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => {
                            const isExpanded = expandedOrderId === order._id;
                            
                            return (
                                <div key={order._id} className="order-card">
                                    <div className="order-card-header" onClick={() => toggleExpand(order._id)}>
                                        <div className="order-info-left">
                                            <span className="order-id">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                                            <span className="order-date">{formatDate(order.createdAt)}</span>
                                        </div>
                                        <div className="order-info-right">
                                            <span className="order-total-price">NPR {order.totalPrice.toFixed(2)}</span>
                                            <span className={`status-badge ${order.orderStatus.toLowerCase()}`}>
                                                {order.orderStatus}
                                            </span>
                                            <svg className={`expand-icon ${isExpanded ? 'expanded' : ''}`} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div className={`order-card-body ${isExpanded ? 'expanded' : ''}`}>
                                        <div className="order-details-grid">
                                            {/* Items */}
                                            <div className="order-items-list">
                                                {order.orderItems.map((item, index) => (
                                                    <div key={index} className="order-item-row">
                                                        <img src={item.image || '/assets/images/placeholder.png'} alt={item.name} className="item-img" />
                                                        <div className="item-info">
                                                            <h4 className="item-name">{item.name}</h4>
                                                            <p className="item-meta">Qty: {item.quantity} × NPR {item.price.toFixed(2)}</p>
                                                        </div>
                                                        <div className="item-price-total">
                                                            NPR {(item.quantity * item.price).toFixed(2)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {/* Meta info */}
                                            <div className="order-meta-info">
                                                <h4>Shipping Address</h4>
                                                <p>
                                                    <strong>{order.shippingAddress.fullName}</strong><br/>
                                                    {order.shippingAddress.street}<br/>
                                                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                                                    {order.shippingAddress.phone}
                                                </p>
                                                
                                                <h4>Payment Method</h4>
                                                <p>{order.paymentMethod}</p>
                                                
                                                {order.orderNote && (
                                                    <>
                                                        <h4>Order Note</h4>
                                                        <p>{order.orderNote}</p>
                                                    </>
                                                )}

                                                {order.cancelReason && (
                                                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#fee2e2', borderRadius: 'var(--radius-sm)', border: '1px solid #fca5a5' }}>
                                                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#b91c1c' }}>Cancellation Reason:</h4>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#991b1b' }}>{order.cancelReason}</p>
                                                    </div>
                                                )}

                                                <div className="summary-totals" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--color-border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <span>Subtotal</span>
                                                        <span>NPR {order.itemsPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                                        <span>Shipping</span>
                                                        <span>NPR {order.shippingPrice.toFixed(2)}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                                                        <span>Total</span>
                                                        <span>NPR {order.totalPrice.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                                
                                                {order.orderStatus === 'Pending' && (
                                                    <div className="action-buttons-wrapper" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                                        <button 
                                                            className="btn-primary" 
                                                            onClick={() => handleEditClick(order)}
                                                            style={{ padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-sm)' }}
                                                        >
                                                            Edit Details
                                                        </button>
                                                        <button 
                                                            className="cancel-btn" 
                                                            onClick={() => handleCancelClick(order)}
                                                            disabled={cancellingId === order._id}
                                                        >
                                                            {cancellingId === order._id ? 'Cancelling...' : 'Cancel Order'}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
            
            {/* Cancel Modal */}
            {cancelModalOrder && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <div className="delete-modal-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </div>
                        <h3>Cancel Order</h3>
                        <p>Are you sure you want to cancel order <strong>#{cancelModalOrder._id.substring(cancelModalOrder._id.length - 8).toUpperCase()}</strong>? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="admin-btn btn-secondary" onClick={closeCancelModal}>Keep Order</button>
                            <button className="admin-btn btn-danger" onClick={confirmCancel}>Yes, Cancel Order</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editModalOrder && (
                <div className="delete-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="delete-modal-content" style={{ maxWidth: '600px', width: '90%', textAlign: 'left', padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Edit Order Details</h3>
                        <form onSubmit={saveEdit}>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name *</label>
                                <input type="text" name="fullName" value={editForm.fullName} onChange={handleEditChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Phone Number *</label>
                                <input type="tel" name="phone" value={editForm.phone} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setEditForm(prev => ({ ...prev, phone: val }));
                                    }} 
                                    required pattern="\d{10}" title="Phone number must be exactly 10 digits" placeholder="10-digit phone number"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} 
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Street Address *</label>
                                <input type="text" name="street" value={editForm.street} onChange={handleEditChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Province *</label>
                                    <select name="state" value={editForm.state} onChange={handleEditStateChange} required style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: '#fff' }}>
                                        <option value="" disabled>Select Province</option>
                                        {Object.keys(nepalData).map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>District *</label>
                                    <select name="city" value={editForm.city} onChange={handleEditChange} required disabled={!editForm.state} style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', background: !editForm.state ? '#f1f5f9' : '#fff' }}>
                                        <option value="" disabled>Select District</option>
                                        {editForm.state && nepalData[editForm.state].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Order Note</label>
                                <textarea name="orderNote" value={editForm.orderNote} onChange={handleEditChange} rows="3" style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}></textarea>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button type="button" className="admin-btn btn-secondary" onClick={closeEditModal} style={{ padding: '0.75rem 1.5rem' }}>Cancel</button>
                                <button type="submit" className="admin-btn btn-primary" disabled={isSaving} style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </div>
    );
};

export default MyOrders;
