import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard/ProductCard';
import './TrendingProducts.css';

const TrendingProducts = () => {
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await fetch('/api/homepage');
                const data = await res.json();
                if (data.trendingProducts && data.trendingProducts.length > 0) {
                    setTrending(data.trendingProducts);
                }
            } catch (error) {
                console.error("Failed to load trending products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (loading) {
        return (
            <section className="trending-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Trending Products</h2>
                    </div>
                    <div className="loading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', opacity: 0.5 }}>
                        {[...Array(9)].map((_, i) => (
                            <div key={i} style={{ height: '350px', backgroundColor: 'var(--surface-color)', borderRadius: '16px' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (trending.length === 0) return null;

    return (
        <section className="trending-section">
            <div className="container">
                <div className="section-header">
                    <h2>Trending Products</h2>
                    <p>Discover our most loved organic products</p>
                </div>
                
                {/* Now using a 3x3 grid for 9 products */}
                <div className="trending-grid">
                    {trending.map((product, index) => (
                        <div 
                            key={product._id || index}
                            className="trending-item"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <div className="view-all-container">
                    <Link to="/products" className="btn-view-all">
                        View All Products
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default TrendingProducts;
