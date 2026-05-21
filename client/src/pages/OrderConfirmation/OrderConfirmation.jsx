import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './OrderConfirmation.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderConfirmation = () => {
    const { id: orderId } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`${API_URL}/orders/${orderId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                if (res.ok) {
                    setOrder(data);
                } else {
                    setError(data.message || 'Order not found');
                }
            } catch (err) {
                setError('Failed to fetch order details');
            } finally {
                setLoading(false);
            }
        };

        if (token && orderId) {
            fetchOrder();
        }
    }, [orderId, token]);

    if (loading) {
        return (
            <div className="order-confirmation-page">
                <Navbar />
                <div className="loading-spinner">Loading your order details...</div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="order-confirmation-page">
                <Navbar />
                <div className="confirmation-container">
                    <div className="confirmation-card" style={{ padding: '4rem 2rem' }}>
                        <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Oops!</h2>
                        <p>{error || 'We could not find that order.'}</p>
                        <Link to="/products" className="btn-primary" style={{ display: 'inline-block', marginTop: '2rem' }}>Return to Shop</Link>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate delivery date (3-5 days from now)
    const orderDate = new Date(order.createdAt);
    const minDelivery = new Date(orderDate);
    minDelivery.setDate(minDelivery.getDate() + 3);
    const maxDelivery = new Date(orderDate);
    maxDelivery.setDate(maxDelivery.getDate() + 5);

    const formatDeliveryDate = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="order-confirmation-page">
            <Navbar />
            
            <main className="confirmation-container">
                <div className="confirmation-card">
                    <div className="success-icon-wrapper">
                        <div className="success-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </div>
                    
                    <h1 className="confirmation-title">Order Placed Successfully!</h1>
                    <p className="confirmation-subtitle">Thank you for your purchase. Your order is being processed.</p>
                    
                    <div className="order-details-box">
                        <div className="detail-row">
                            <span className="detail-label">Order Number</span>
                            <span className="detail-value order-id-highlight">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                        </div>
                        
                        <div className="detail-row">
                            <span className="detail-label">Estimated Delivery</span>
                            <span className="detail-value">{formatDeliveryDate(minDelivery)} - {formatDeliveryDate(maxDelivery)}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Payment Method</span>
                            <span className="detail-value">{order.paymentMethod}</span>
                        </div>

                        <div className="detail-row">
                            <span className="detail-label">Total Amount</span>
                            <span className="detail-value" style={{ fontSize: '1.1rem', fontWeight: '700' }}>NPR {order.totalPrice.toFixed(2)}</span>
                        </div>
                        
                        <div className="detail-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <span className="detail-label">Shipping To</span>
                            <span className="detail-value" style={{ textAlign: 'left', fontWeight: '400', lineHeight: '1.5' }}>
                                <strong>{order.shippingAddress.fullName}</strong><br/>
                                {order.shippingAddress.street}<br/>
                                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br/>
                                Phone: {order.shippingAddress.phone}
                            </span>
                        </div>
                    </div>
                    
                    <div className="action-buttons">
                        <Link to="/my-orders" className="btn-primary">View My Orders</Link>
                        <Link to="/products" className="btn-outline">Continue Shopping</Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default OrderConfirmation;
