import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Toast from '../../components/Toast/Toast';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './Products.css';

const formatProduct = (p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.discountPrice ? p.discountPrice : p.price,
    originalPrice: p.discountPrice ? p.price : null,
    image: p.images && p.images.length > 0 ? p.images[0] : '/assets/images/placeholder.png',
    category: p.categorySlug,
    isNew: p.isNew
});

const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'medicinal-herbs', label: 'Medicinal Herbs' },
    { value: 'essential-oils', label: 'Natural Essential Oils' },
    { value: 'herbal-oils', label: 'Natural Herbal Oils' },
    { value: 'superfoods', label: 'Natural Organic Super Foods' },
    { value: 'cosmetics', label: 'Natural Cosmetics' },
    { value: 'spices', label: 'Natural Organic Spices' },
    { value: 'spiritual-items', label: 'Spiritual Items' },
    { value: 'nursery', label: 'Sara Nursery' }
];

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'all';
    const searchQuery = searchParams.get('search') || '';
    
    const [selectedCategory, setSelectedCategory] = useState(initialCategory);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            try {
                let url = 'http://localhost:5000/api/products';
                if (searchQuery) {
                    url += `?keyword=${encodeURIComponent(searchQuery)}`;
                }
                const res = await fetch(url);
                const data = await res.json();
                setProducts(data.map(formatProduct));
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, [searchQuery]);

    // Sync with URL changes (e.g., when clicking back button or links from home page)
    useEffect(() => {
        const categoryFromUrl = searchParams.get('category') || 'all';
        if (categoryFromUrl !== selectedCategory) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedCategory(categoryFromUrl);
            setCurrentPage(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const itemsPerPage = 12;

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(1);
        setIsDropdownOpen(false);
        
        if (category === 'all') {
            searchParams.delete('category');
            setSearchParams(searchParams);
        } else {
            searchParams.set('category', category);
            setSearchParams(searchParams);
        }
    };

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const selectedCategoryLabel = categories.find(c => c.value === selectedCategory)?.label || 'All Products';
    const pageTitle = searchQuery ? `Search Results for "${searchQuery}"` : selectedCategoryLabel;

    return (
        <div className="products-page">
            <Navbar />

            <main className="products-main">
                <div className="container">
                    <h1 className="products-title">{pageTitle}</h1>

                    <div className="products-header">
                        <p className="products-count">{isLoading ? 'Loading products...' : `Showing ${filteredProducts.length} Results`}</p>

                        <div className="products-filter">
                            <div
                                className={`filter-dropdown ${isDropdownOpen ? 'open' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span>{selectedCategoryLabel}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="m6 9 6 6 6-6" />
                                </svg>

                                {isDropdownOpen && (
                                    <ul className="dropdown-menu">
                                        {categories.map(cat => (
                                            <li
                                                key={cat.value}
                                                className={selectedCategory === cat.value ? 'active' : ''}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCategoryChange(cat.value);
                                                }}
                                            >
                                                {cat.label}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="products-grid">
                        {paginatedProducts.map(product => (
                            <Link to={`/products/${product.slug}`} key={product.id} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="product-image" style={{ position: 'relative' }}>
                                    {product.isNew && <span className="product-badge">New</span>}
                                    <button 
                                        className="product-wishlist-icon"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const success = await toggleWishlist(product.id);
                                            if (success) setToast({ message: isInWishlist(product.id) ? 'Removed from wishlist' : 'Added to wishlist', type: 'success' });
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'white',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            zIndex: 10,
                                            color: isInWishlist(product.id) ? 'var(--color-danger)' : 'var(--color-text-muted)'
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    </button>
                                    <img src={product.image} alt={product.name} />
                                    <button 
                                        className="product-buy-btn"
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const success = await addToCart(product.id, 1);
                                            if (success) setToast({ message: 'Added to cart!', type: 'success' });
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                <div className="product-info">
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-price">
                                        <span className="current-price">NPR {product.price.toFixed(2)}</span>
                                        {product.originalPrice && (
                                            <span className="original-price">NPR {product.originalPrice.toFixed(2)}</span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button 
                                className="pagination-btn" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            
                            <div className="pagination-numbers">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button 
                                        key={i + 1}
                                        className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button 
                                className="pagination-btn" 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />
        </div>
    );
};

export default Products;
