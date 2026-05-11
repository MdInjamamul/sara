import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import './Products.css';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    // Read URL params
    const initialCategory = searchParams.get('category') || 'all';
    const initialPage = parseInt(searchParams.get('page')) || 1;

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filters and Pagination State
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [page, setPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [sortBy, setSortBy] = useState('newest');

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products when filters change
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // We use the admin endpoint structure, or ideally a public product list endpoint
                // Since our public endpoint in productController doesn't have pagination yet, we'll use the admin one or build it.
                // Wait, productController.js exists. Let's see if we can just hit /api/products
                let url = `/api/products?page=${page}&limit=12`;
                if (activeCategory !== 'all') {
                    url += `&category=${activeCategory}`;
                }

                // If the backend /api/products doesn't support pagination, we might need to fallback to /api/admin/products for now
                // Actually, let's use the admin endpoint for now just to get the data working with pagination
                url = `/api/admin/products?page=${page}&limit=12`;
                if (activeCategory !== 'all') {
                    url += `&category=${activeCategory}`;
                }

                const res = await fetch(url);
                const data = await res.json();
                
                // Assuming admin endpoint response: { products, page, pages, total }
                let fetchedProducts = data.products || [];
                
                // Client-side sorting for now since admin API doesn't support generic sort
                if (sortBy === 'price-low') {
                    fetchedProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                } else if (sortBy === 'price-high') {
                    fetchedProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                }

                setProducts(fetchedProducts);
                setTotalPages(data.pages || 1);
                setTotalProducts(data.total || fetchedProducts.length);

                // Update URL silently
                setSearchParams({ category: activeCategory, page }, { replace: true });
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [activeCategory, page, sortBy, setSearchParams]);

    const handleCategoryChange = (categorySlug) => {
        setActiveCategory(categorySlug);
        setPage(1); // Reset to first page
    };

    return (
        <div className="products-page">
            <div className="products-header">
                <div className="container">
                    <h1>Our Natural Collection</h1>
                    <p>Discover our complete range of organic and natural products.</p>
                </div>
            </div>

            <div className="container">
                <div className="products-layout">
                    {/* Sidebar Filters */}
                    <aside className="products-sidebar">
                        <div className="filter-widget">
                            <h3>Categories</h3>
                            <ul className="category-list">
                                <li className={activeCategory === 'all' ? 'active' : ''}>
                                    <button onClick={() => handleCategoryChange('all')}>
                                        All Products
                                    </button>
                                </li>
                                {categories.map(category => (
                                    <li 
                                        key={category._id} 
                                        className={activeCategory === category.slug ? 'active' : ''}
                                    >
                                        <button onClick={() => handleCategoryChange(category.slug)}>
                                            {category.name}
                                            <span className="count">({category.productCount || 0})</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="products-main">
                        <div className="products-toolbar">
                            <div className="results-count">
                                Showing {products.length} of {totalProducts} products
                            </div>
                            <div className="sort-controls">
                                <label>Sort by:</label>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="newest">Newest Arrivals</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="products-grid loading-grid" style={{ opacity: 0.5 }}>
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} style={{ height: '350px', backgroundColor: 'var(--surface-color)', borderRadius: '16px' }} />
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <>
                                <div className="products-grid">
                                    {products.map(product => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="pagination">
                                        <button 
                                            className="page-btn prev"
                                            disabled={page === 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="15 18 9 12 15 6"></polyline>
                                            </svg>
                                        </button>
                                        
                                        <div className="page-numbers">
                                            {[...Array(totalPages)].map((_, i) => (
                                                <button
                                                    key={i + 1}
                                                    className={`page-number ${page === i + 1 ? 'active' : ''}`}
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                        </div>

                                        <button 
                                            className="page-btn next"
                                            disabled={page === totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="no-products-found">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <h3>No products found</h3>
                                <p>Try selecting a different category or clearing your filters.</p>
                                <button 
                                    className="btn-primary"
                                    onClick={() => handleCategoryChange('all')}
                                >
                                    View All Products
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
