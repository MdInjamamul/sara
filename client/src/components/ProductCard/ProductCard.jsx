import './ProductCard.css';

const ProductCard = ({ product }) => {
    const formatPrice = (price) => {
        return `Rs. ${price.toLocaleString()}`;
    };

    return (
        <div className="product-card">
            <div className="product-card-image">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                />
                <div className="product-card-badges">
                    {product.isNew && <span className="badge badge-new">New</span>}
                    {product.isBestseller && <span className="badge badge-bestseller">Bestseller</span>}
                </div>
            </div>

            <div className="product-card-content">
                <span className="product-card-category">{product.categorySlug}</span>
                <h4 className="product-card-title">
                    <a href={`/product/${product.slug}`}>{product.name}</a>
                </h4>
                <div className="product-card-price">
                    <span className="current-price">
                        {formatPrice(product.discountPrice || product.price)}
                    </span>
                    {product.discountPrice && (
                        <span className="original-price">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>

            <button className="product-card-action" aria-label="Add to cart">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                    <path d="M3 6h18"></path>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
            </button>
        </div>
    );
};

export default ProductCard;
