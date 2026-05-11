import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    const imageUrl = product.image || (product.images && product.images[0]) || '/placeholder.png';
    const currentPrice = product.discountPrice || product.price;
    const originalPrice = product.originalPrice || (product.discountPrice ? product.price : null);
    
    // Determine currency based on magnitude (since sample data mixes USD and Rs)
    const formatPrice = (price) => {
        if (!price) return '';
        // Assuming Rs now for everything since we refactored
        return `Rs. ${price.toLocaleString()}`;
    };

    return (
        <Link to={`/products/${product.slug}`} className={`product-card ${!product.inStock ? 'out-of-stock-card' : ''}`}>
            <div className="product-image">
                <div className="product-badges">
                    {!product.inStock && <span className="product-badge out-of-stock-badge">Out of Stock</span>}
                    {product.inStock && product.isOffer && (
                        <span className="product-badge offer-badge">{product.offerLabel || 'Special Offer'}</span>
                    )}
                    {product.inStock && product.isBestseller && <span className="product-badge bestseller-badge">Bestseller</span>}
                    {product.inStock && product.isNew && <span className="product-badge new-badge">New</span>}
                </div>
                
                <img src={imageUrl} alt={product.name} />
                <span className="product-buy-btn">
                    {product.inStock ? 'View Details' : 'Sold Out'}
                </span>
            </div>
            <div className="product-info">
                <h3 className="product-name" title={product.name}>{product.name}</h3>
                <div className="product-price">
                    <span className="current-price">{formatPrice(currentPrice)}</span>
                    {originalPrice && (
                        <span className="original-price">{formatPrice(originalPrice)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;
