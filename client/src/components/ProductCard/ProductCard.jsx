import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
    // Handle both data structures
    const imageUrl = product.image || (product.images && product.images[0]);
    const currentPrice = product.discountPrice || product.price;
    const originalPrice = product.originalPrice || (product.discountPrice ? product.price : null);
    
    // Determine currency based on magnitude (since sample data mixes USD and Rs)
    const formatPrice = (price) => {
        if (!price) return '';
        if (price < 1000) {
            return `$ ${price.toFixed(2)} USD`;
        }
        return `Rs. ${price.toLocaleString()}`;
    };

    return (
        <Link to={`/products/${product.slug}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-image">
                {product.isNew && <span className="product-badge">New</span>}
                <img src={imageUrl} alt={product.name} />
                <span className="product-buy-btn">View Details</span>
            </div>
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
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
