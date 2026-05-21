import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CategorySection.css';

const CategorySection = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // The homepage API gives us categories with the resolved image!
                const res = await fetch('/api/homepage');
                const data = await res.json();
                if (data.categories) {
                    setCategories(data.categories);
                }
            } catch (error) {
                console.error("Failed to load categories:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) {
        return (
            <section className="category-section">
                <div className="container">
                    <div className="section-header">
                        <h2>Shop by Category</h2>
                    </div>
                    <div className="category-grid" style={{ opacity: 0.5 }}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} style={{ height: '300px', backgroundColor: 'var(--surface-color)', borderRadius: '16px' }} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) return null;

    return (
        <section className="category-section">
            <div className="container">
                <div className="section-header">
                    <h2>Shop by Category</h2>
                    <p>Explore our wide range of natural and organic collections</p>
                </div>
                
                <div className="category-grid">
                    {categories.map((category, index) => (
                        <Link 
                            to={`/products?category=${category.slug}`} 
                            key={category._id}
                            className={`category-card ${index === 0 || index === 3 ? 'large' : ''}`}
                        >
                            <div className="category-image">
                                <img src={category.image} alt={category.name} />
                                <div className="category-overlay"></div>
                            </div>
                            <div className="category-content">
                                <h3>{category.name}</h3>
                                <span className="product-count">{category.productCount || 0} Products</span>
                                <span className="explore-btn">
                                    Explore
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
