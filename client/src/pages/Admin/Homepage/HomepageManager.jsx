import { useState, useEffect } from 'react';
import { useToast } from '../../../context/ToastContext';
import './HomepageManager.css';

const HomepageManager = () => {
    const [config, setConfig] = useState(null);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]); // All products for selection
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hero'); // 'hero', 'trending', 'categories'
    
    // Modal state for product selection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState(null); // { type, slideIndex, categorySlug }
    const [searchQuery, setSearchQuery] = useState('');

    const toast = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const [configRes, catRes, prodRes] = await Promise.all([
                fetch('/api/admin/homepage'),
                fetch('/api/categories'),
                fetch('/api/admin/products?limit=1000') // Get all for simple modal picking
            ]);

            const configData = await configRes.json();
            const catData = await catRes.json();
            const prodData = await prodRes.json();

            // Initialize default structure if empty
            if (!configData.heroSlides) configData.heroSlides = [];
            if (!configData.trendingProducts) configData.trendingProducts = [];
            if (!configData.populatedCategoryDisplay) configData.populatedCategoryDisplay = {};

            // Ensure hero slides exist for all categories
            catData.forEach(cat => {
                const exists = configData.heroSlides.find(s => s.categorySlug === cat.slug);
                if (!exists) {
                    configData.heroSlides.push({
                        categorySlug: cat.slug,
                        title: cat.name,
                        subtitle: 'NEW ARRIVALS',
                        description: 'Discover our amazing products.',
                        accentColor: '#4ade80',
                        products: [],
                        isActive: false
                    });
                }
            });

            setConfig(configData);
            setCategories(catData);
            setProducts(prodData.products || []);
        } catch (error) {
            toast.error('Failed to load homepage configuration');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Hero Management ---

    const handleHeroChange = (slideIndex, field, value) => {
        const newConfig = { ...config };
        newConfig.heroSlides[slideIndex][field] = value;
        setConfig(newConfig);
    };

    const removeProductFromHero = (slideIndex, productId) => {
        const newConfig = { ...config };
        newConfig.heroSlides[slideIndex].products = newConfig.heroSlides[slideIndex].products.filter(p => p._id !== productId);
        setConfig(newConfig);
    };

    const saveHeroSlides = async () => {
        try {
            // Validate exactly 3 products for active slides
            for (const slide of config.heroSlides) {
                if (slide.isActive && slide.products.length !== 3) {
                    toast.error(`Active slide "${slide.title}" must have exactly 3 products selected.`);
                    return;
                }
            }

            const formattedSlides = config.heroSlides.map(slide => ({
                ...slide,
                products: slide.products.map(p => p._id || p) // ensure we just send IDs
            }));

            const res = await fetch('/api/admin/homepage/hero', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ heroSlides: formattedSlides })
            });

            if (!res.ok) throw new Error('Failed to save Hero settings');
            toast.success('Hero settings saved successfully');
            fetchData(); // Refresh to get populated objects again
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- Trending Management ---

    const removeProductFromTrending = (productId) => {
        const newConfig = { ...config };
        newConfig.trendingProducts = newConfig.trendingProducts.filter(p => p._id !== productId);
        setConfig(newConfig);
    };

    const saveTrendingProducts = async () => {
        try {
            if (config.trendingProducts.length !== 9) {
                toast.error(`You must select exactly 9 trending products (currently ${config.trendingProducts.length}).`);
                return;
            }

            // Check max 2 per category rule
            const catCounts = {};
            for (const p of config.trendingProducts) {
                catCounts[p.categorySlug] = (catCounts[p.categorySlug] || 0) + 1;
                if (catCounts[p.categorySlug] > 2) {
                    toast.error(`You can select a maximum of 2 products from category '${p.categorySlug}'.`);
                    return;
                }
            }

            const productIds = config.trendingProducts.map(p => p._id || p);

            const res = await fetch('/api/admin/homepage/trending', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trendingProducts: productIds })
            });

            if (!res.ok) throw new Error(await res.text());
            toast.success('Trending products saved successfully');
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- Category Display Management ---

    const saveCategoryDisplay = async (categorySlug, productId) => {
        try {
            const res = await fetch('/api/admin/homepage/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ categorySlug, productId })
            });

            if (!res.ok) throw new Error('Failed to save category image');
            toast.success('Category image updated');
            fetchData();
        } catch (error) {
            toast.error(error.message);
        }
    };

    // --- Modal Logic ---

    const openModal = (type, slideIndex = null, categorySlug = null) => {
        setModalContext({ type, slideIndex, categorySlug });
        setIsModalOpen(true);
        setSearchQuery('');
    };

    const handleSelectProduct = (product) => {
        const { type, slideIndex } = modalContext;
        const newConfig = { ...config };

        if (type === 'hero') {
            const slide = newConfig.heroSlides[slideIndex];
            if (slide.products.find(p => p._id === product._id)) {
                toast.warning('Product already selected in this slide');
                return;
            }
            if (slide.products.length >= 3) {
                toast.warning('Maximum 3 products allowed per slide');
                return;
            }
            slide.products.push(product);
        } else if (type === 'trending') {
            if (newConfig.trendingProducts.find(p => p._id === product._id)) {
                toast.warning('Product already in trending');
                return;
            }
            if (newConfig.trendingProducts.length >= 9) {
                toast.warning('Maximum 9 trending products allowed');
                return;
            }
            
            // Preview check for 2 per category rule
            const catCount = newConfig.trendingProducts.filter(p => p.categorySlug === product.categorySlug).length;
            if (catCount >= 2) {
                toast.warning(`Maximum 2 products allowed from ${product.categorySlug}`);
                return;
            }

            newConfig.trendingProducts.push(product);
        } else if (type === 'category') {
            // Direct save for category image
            saveCategoryDisplay(modalContext.categorySlug, product._id);
            setIsModalOpen(false);
            return;
        }

        setConfig(newConfig);
        setIsModalOpen(false);
    };

    // Filter products for modal
    const filteredModalProducts = products.filter(p => {
        // Filter by search
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        
        // Filter by context constraints
        if (modalContext?.type === 'hero') {
            const requiredCat = config.heroSlides[modalContext.slideIndex].categorySlug;
            return p.categorySlug === requiredCat;
        }
        if (modalContext?.type === 'category') {
            return p.categorySlug === modalContext.categorySlug;
        }
        return true; // trending can be any category
    });


    if (loading) return <div className="admin-loading"><div className="admin-spinner"></div><p>Loading config...</p></div>;

    return (
        <div className="homepage-manager">
            <div className="admin-page-header">
                <h2>Homepage Configuration</h2>
            </div>

            <div className="admin-tabs">
                <button 
                    className={`admin-tab ${activeTab === 'hero' ? 'active' : ''}`}
                    onClick={() => setActiveTab('hero')}
                >
                    Hero Slides
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'trending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trending')}
                >
                    Trending Products
                </button>
                <button 
                    className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
                    onClick={() => setActiveTab('categories')}
                >
                    Category Images
                </button>
            </div>

            <div className="admin-tab-content">
                
                {/* --- HERO SLIDES TAB --- */}
                {activeTab === 'hero' && (
                    <div className="hero-manager">
                        <div className="tab-header">
                            <p className="tab-hint">
                                Configure the main hero slider. You can enable slides per category. 
                                Each active slide <strong>must have exactly 3 products</strong> selected.
                            </p>
                            <button className="admin-btn-save" onClick={saveHeroSlides}>Save Hero Settings</button>
                        </div>

                        <div className="slides-grid">
                            {config?.heroSlides?.map((slide, index) => (
                                <div key={slide.categorySlug} className={`slide-card ${slide.isActive ? 'active-slide' : ''}`}>
                                    <div className="slide-card-header">
                                        <div className="slide-title-group">
                                            <h3>{categories.find(c => c.slug === slide.categorySlug)?.name || slide.categorySlug}</h3>
                                            <label className="toggle-switch">
                                                <input 
                                                    type="checkbox" 
                                                    checked={slide.isActive} 
                                                    onChange={(e) => handleHeroChange(index, 'isActive', e.target.checked)}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                    </div>

                                    {slide.isActive && (
                                        <div className="slide-form">
                                            <input 
                                                type="text" 
                                                value={slide.title} 
                                                onChange={(e) => handleHeroChange(index, 'title', e.target.value)} 
                                                placeholder="Slide Title"
                                                className="admin-input"
                                            />
                                            <input 
                                                type="text" 
                                                value={slide.subtitle} 
                                                onChange={(e) => handleHeroChange(index, 'subtitle', e.target.value)} 
                                                placeholder="Subtitle"
                                                className="admin-input"
                                            />
                                            <textarea 
                                                value={slide.description} 
                                                onChange={(e) => handleHeroChange(index, 'description', e.target.value)} 
                                                placeholder="Description"
                                                className="admin-input"
                                                rows="2"
                                            ></textarea>
                                            
                                            <div className="color-picker-group">
                                                <label>Accent Color</label>
                                                <input 
                                                    type="color" 
                                                    value={slide.accentColor} 
                                                    onChange={(e) => handleHeroChange(index, 'accentColor', e.target.value)} 
                                                />
                                            </div>

                                            <div className="slide-products">
                                                <div className="slide-products-header">
                                                    <h4>Selected Products ({slide.products.length}/3)</h4>
                                                    {slide.products.length < 3 && (
                                                        <button 
                                                            className="btn-text-primary" 
                                                            onClick={() => openModal('hero', index)}
                                                        >
                                                            + Add Product
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="selected-products-list">
                                                    {slide.products.map(product => (
                                                        <div key={product._id} className="selected-product-item">
                                                            <div className="spi-img">
                                                                <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} />
                                                            </div>
                                                            <span className="spi-name" title={product.name}>{product.name}</span>
                                                            <button 
                                                                className="btn-remove-spi" 
                                                                onClick={() => removeProductFromHero(index, product._id)}
                                                                title="Remove"
                                                            >×</button>
                                                        </div>
                                                    ))}
                                                    {slide.products.length === 0 && (
                                                        <p className="empty-selection">No products selected yet.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- TRENDING PRODUCTS TAB --- */}
                {activeTab === 'trending' && (
                    <div className="trending-manager">
                        <div className="tab-header">
                            <div>
                                <p className="tab-hint">
                                    Select exactly <strong>9 products</strong> for the trending grid.
                                </p>
                                <p className="tab-hint text-warning">
                                    Rule: Maximum 2 products from any single category.
                                </p>
                            </div>
                            <button className="admin-btn-save" onClick={saveTrendingProducts}>Save Trending</button>
                        </div>

                        <div className="trending-status">
                            <h4>Selected: {config?.trendingProducts?.length || 0} / 9</h4>
                            {config?.trendingProducts?.length < 9 && (
                                <button className="admin-btn-secondary" onClick={() => openModal('trending')}>
                                    + Add to Trending
                                </button>
                            )}
                        </div>

                        <div className="trending-grid">
                            {/* Empty slots placeholders (up to 9) */}
                            {Array.from({ length: 9 }).map((_, i) => {
                                const product = config?.trendingProducts?.[i];
                                return product ? (
                                    <div key={product._id} className="trending-slot filled">
                                        <div className="ts-img">
                                            <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} />
                                        </div>
                                        <div className="ts-info">
                                            <span className="ts-name">{product.name}</span>
                                            <span className="ts-cat">{product.categorySlug}</span>
                                        </div>
                                        <button className="btn-remove-ts" onClick={() => removeProductFromTrending(product._id)}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div key={`empty-${i}`} className="trending-slot empty" onClick={() => openModal('trending')}>
                                        <div className="ts-placeholder">
                                            <span>+</span>
                                            <p>Add Product</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* --- CATEGORIES TAB --- */}
                {activeTab === 'categories' && (
                    <div className="categories-manager">
                        <div className="tab-header">
                            <p className="tab-hint">
                                Select one product from each category to represent it with an image on the home page.
                            </p>
                        </div>

                        <div className="category-display-grid">
                            {categories.map(cat => {
                                const selectedProduct = config?.populatedCategoryDisplay?.[cat.slug];
                                return (
                                    <div key={cat._id} className="cat-display-card">
                                        <div className="cdc-header">
                                            <h3>{cat.name}</h3>
                                        </div>
                                        <div className="cdc-image">
                                            {selectedProduct ? (
                                                <img src={selectedProduct.images?.[0] || '/placeholder.png'} alt={cat.name} />
                                            ) : (
                                                <div className="cdc-placeholder">No Image Selected</div>
                                            )}
                                        </div>
                                        <div className="cdc-footer">
                                            {selectedProduct ? (
                                                <p className="cdc-prod-name">Using: {selectedProduct.name}</p>
                                            ) : (
                                                <p className="cdc-prod-name text-warning">Please select a product</p>
                                            )}
                                            <button 
                                                className="admin-btn-secondary btn-sm"
                                                onClick={() => openModal('category', null, cat.slug)}
                                            >
                                                {selectedProduct ? 'Change Product' : 'Select Product'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* --- PRODUCT PICKER MODAL --- */}
            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>
                                Select Product 
                                {modalContext?.type === 'hero' && ` for ${config.heroSlides[modalContext.slideIndex].title}`}
                            </h3>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <input 
                                type="text" 
                                className="admin-input search-input" 
                                placeholder="Search products..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <div className="modal-product-list">
                                {filteredModalProducts.length === 0 ? (
                                    <p className="no-results">No products found matching criteria.</p>
                                ) : (
                                    filteredModalProducts.map(p => (
                                        <div key={p._id} className="modal-product-item" onClick={() => handleSelectProduct(p)}>
                                            <img src={p.images?.[0] || '/placeholder.png'} alt={p.name} />
                                            <div className="mpi-info">
                                                <strong>{p.name}</strong>
                                                <span>{p.categorySlug} | Rs. {p.price}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomepageManager;
