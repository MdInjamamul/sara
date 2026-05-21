import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';
import './Checkout.css';

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

const Checkout = () => {
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const { cart, loading: cartLoading, clearCart } = useCart();

    const [shippingAddress, setShippingAddress] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: user?.location || '',
        state: '',
        zipCode: '',
        country: 'Nepal'
    });
    const [orderNote, setOrderNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    // If cart is empty, redirect
    useEffect(() => {
        if (!cartLoading && cart.length === 0) {
            navigate('/products');
        }
    }, [cart, cartLoading, navigate]);

    // Populate user details if loaded async
    useEffect(() => {
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                fullName: prev.fullName || user.name || '',
                phone: prev.phone || user.phone || '',
                city: prev.city || user.location || ''
            }));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setShippingAddress(prev => ({ 
            ...prev, 
            state: selectedState,
            city: '' // Reset district when state changes
        }));
    };

    const calculateSubtotal = () => {
        return cart.reduce((sum, item) => sum + (item.product.discountPrice || item.product.price) * item.quantity, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state) {
            setToast({ message: 'Please fill in all required fields.', type: 'error' });
            return;
        }

        setIsSubmitting(true);

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    shippingAddress,
                    orderNote
                })
            });

            const data = await res.json();

            if (res.ok) {
                clearCart();
                navigate(`/order-confirmation/${data._id}`);
            } else {
                setToast({ message: data.message || 'Failed to place order', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cartLoading || cart.length === 0) {
        return <div className="checkout-page"><Navbar /></div>; // Empty shell while redirecting
    }

    const subtotal = calculateSubtotal();

    return (
        <div className="checkout-page">
            <Navbar />
            
            <main className="checkout-main">
                <div className="checkout-layout">
                    
                    {/* Left: Delivery Form */}
                    <section className="checkout-form-section">
                        <form className="checkout-form" onSubmit={handleSubmit}>
                            <h2 className="checkout-section-title" style={{ marginTop: 0 }}>Delivery Details</h2>
                            <div className="form-group">
                                <label>Full Name <span>*</span></label>
                                <input 
                                    type="text" 
                                    name="fullName" 
                                    value={shippingAddress.fullName} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number <span>*</span></label>
                                <input 
                                    type="tel" 
                                    name="phone" 
                                    value={shippingAddress.phone} 
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setShippingAddress(prev => ({ ...prev, phone: val }));
                                    }} 
                                    required 
                                    pattern="\d{10}"
                                    title="Phone number must be exactly 10 digits"
                                    placeholder="10-digit phone number"
                                />
                            </div>

                            <div className="form-group">
                                <label>Street Address <span>*</span></label>
                                <input 
                                    type="text" 
                                    name="street" 
                                    value={shippingAddress.street} 
                                    onChange={handleInputChange} 
                                    required 
                                    placeholder="House number and street name"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>State/Province <span>*</span></label>
                                    <select 
                                        name="state" 
                                        value={shippingAddress.state} 
                                        onChange={handleStateChange} 
                                        required 
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', background: '#fff', cursor: 'pointer' }}
                                    >
                                        <option value="" disabled>Select Province</option>
                                        {Object.keys(nepalData).map(province => (
                                            <option key={province} value={province}>{province}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>District/City <span>*</span></label>
                                    <select 
                                        name="city" 
                                        value={shippingAddress.city} 
                                        onChange={handleInputChange} 
                                        required 
                                        disabled={!shippingAddress.state}
                                        style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '1rem', background: !shippingAddress.state ? '#f1f5f9' : '#fff', cursor: !shippingAddress.state ? 'not-allowed' : 'pointer' }}
                                    >
                                        <option value="" disabled>Select District</option>
                                        {shippingAddress.state && nepalData[shippingAddress.state].map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>ZIP/Postal Code (Optional)</label>
                                    <input 
                                        type="text" 
                                        name="zipCode" 
                                        value={shippingAddress.zipCode} 
                                        onChange={handleInputChange} 
                                        placeholder="ZIP Code"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Country <span>*</span></label>
                                    <input 
                                        type="text" 
                                        name="country" 
                                        value={shippingAddress.country} 
                                        onChange={handleInputChange} 
                                        required 
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Order Notes (Optional)</label>
                                <textarea 
                                    name="orderNote" 
                                    value={orderNote} 
                                    onChange={(e) => setOrderNote(e.target.value)} 
                                    placeholder="Notes about your order, e.g. special notes for delivery."
                                    rows="3"
                                ></textarea>
                            </div>
                            
                            <h2 className="checkout-section-title" style={{ marginTop: '2rem' }}>Payment Method</h2>
                            <div className="payment-method-display">
                                <div className="payment-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="2" y="6" width="20" height="12" rx="2" ry="2"></rect>
                                        <circle cx="12" cy="12" r="2"></circle>
                                        <path d="M6 12h.01M18 12h.01"></path>
                                    </svg>
                                </div>
                                <div className="payment-details">
                                    <h4>Cash on Delivery</h4>
                                    <p>Pay with cash upon delivery.</p>
                                </div>
                            </div>
                        </form>
                    </section>

                    {/* Right: Order Summary */}
                    <section className="checkout-summary-section">
                        <div className="order-summary-card">
                            <h2 className="checkout-section-title" style={{ marginTop: 0 }}>Order Summary</h2>
                            
                            <div className="summary-items">
                                {cart.map(item => (
                                    <div key={item.product._id} className="summary-item">
                                        <img src={item.product.images?.[0] || '/assets/images/placeholder.png'} alt={item.product.name} className="summary-item-img" />
                                        <div className="summary-item-details">
                                            <h4 className="summary-item-name">{item.product.name}</h4>
                                            <p className="summary-item-meta">
                                                <span>Qty: {item.quantity}</span>
                                                <span>NPR {(item.product.discountPrice || item.product.price).toFixed(2)}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-totals">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>NPR {subtotal.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>NPR {subtotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <button 
                                className="place-order-btn" 
                                onClick={handleSubmit} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </section>
                </div>
            </main>

            <Footer />
            {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />}
        </div>
    );
};

export default Checkout;
