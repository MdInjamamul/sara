import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './WishlistSidebar.css';

const WishlistSidebar = () => {
    const { wishlist, isWishlistOpen, closeWishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();

    if (!isWishlistOpen) return null;

    const handleAddToCart = async (product) => {
        await addToCart(product._id || product, 1);
        // Remove from wishlist after adding to cart
        await toggleWishlist(product._id || product);
    };

    return (
        <>
            <div className={`sidebar-overlay ${isWishlistOpen ? 'open' : ''}`} onClick={closeWishlist}></div>
            <div className={`wishlist-sidebar ${isWishlistOpen ? 'open' : ''}`}>
                <div className="wishlist-sidebar-header">
                    <h2>Your Wishlist ({wishlist.length})</h2>
                    <button className="close-btn" onClick={closeWishlist}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="wishlist-items">
                    {wishlist.length === 0 ? (
                        <div className="empty-wishlist">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                            <p>Your wishlist is empty.</p>
                            <button className="continue-shopping-btn" onClick={closeWishlist}>Explore Products</button>
                        </div>
                    ) : (
                        wishlist.map((item) => {
                            // Backend populates wishlist, or it might be just IDs if not populated properly.
                            // Assuming backend populates wishlist. If not, we need to ensure backend populates it in getWishlist.
                            const product = typeof item === 'object' ? item : { _id: item, name: 'Loading...', price: 0 };
                            
                            return (
                                <div key={product._id} className="wishlist-item">
                                    <img src={product.images?.[0] || '/assets/images/placeholder.png'} alt={product.name} className="wishlist-item-img" />
                                    <div className="wishlist-item-details">
                                        <Link to={`/products/${product.slug}`} onClick={closeWishlist} className="wishlist-item-name">
                                            {product.name}
                                        </Link>
                                        <p className="wishlist-item-price">NPR {(product.discountPrice || product.price)?.toFixed(2) || '0.00'}</p>
                                        <div className="wishlist-item-actions">
                                            <button className="add-to-cart-sm-btn" onClick={() => handleAddToCart(product)}>
                                                Add to Cart
                                            </button>
                                            <button className="remove-icon-btn" onClick={() => toggleWishlist(product._id)} title="Remove from wishlist">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
};

export default WishlistSidebar;
