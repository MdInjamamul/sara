import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './CartSidebar.css';

const CartSidebar = () => {
    const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity } = useCart();

    if (!isCartOpen) return null;

    const calculateTotal = () => {
        return cart.reduce((total, item) => {
            const price = item.product.discountPrice || item.product.price;
            return total + (price * item.quantity);
        }, 0);
    };

    return (
        <>
            <div className={`sidebar-overlay ${isCartOpen ? 'open' : ''}`} onClick={closeCart}></div>
            <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
                <div className="cart-sidebar-header">
                    <h2>Your Cart ({cart.length})</h2>
                    <button className="close-btn" onClick={closeCart}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-cart">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="9" cy="21" r="1"></circle>
                                <circle cx="20" cy="21" r="1"></circle>
                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                            </svg>
                            <p>Your cart is empty.</p>
                            <button className="continue-shopping-btn" onClick={closeCart}>Continue Shopping</button>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.product._id} className="cart-item">
                                <img src={item.product.images?.[0] || '/assets/images/placeholder.png'} alt={item.product.name} className="cart-item-img" />
                                <div className="cart-item-details">
                                    <Link to={`/products/${item.product.slug}`} onClick={closeCart} className="cart-item-name">
                                        {item.product.name}
                                    </Link>
                                    <p className="cart-item-price">NPR {(item.product.discountPrice || item.product.price).toFixed(2)}</p>
                                    <div className="cart-item-actions">
                                        <div className="cart-item-qty-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-light)', borderRadius: '12px', padding: '2px 6px' }}>
                                            <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}>-</button>
                                            <span className="cart-item-qty" style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)} 
                                                disabled={item.quantity >= item.product.stock}
                                                style={{ 
                                                    background: 'none', 
                                                    border: 'none', 
                                                    cursor: item.quantity >= item.product.stock ? 'not-allowed' : 'pointer', 
                                                    fontSize: '1rem', 
                                                    padding: '0 4px',
                                                    opacity: item.quantity >= item.product.stock ? 0.5 : 1
                                                }}
                                            >+</button>
                                        </div>
                                        <button className="remove-btn" onClick={() => removeFromCart(item.product._id)}>Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="cart-sidebar-footer">
                        <div className="cart-total">
                            <span>Total</span>
                            <span>NPR {calculateTotal().toFixed(2)}</span>
                        </div>
                        <p className="shipping-note">Shipping & taxes calculated at checkout</p>
                        <Link to="/checkout" className="checkout-btn" onClick={closeCart} style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartSidebar;
