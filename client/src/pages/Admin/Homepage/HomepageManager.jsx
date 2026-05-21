import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import Toast from '../../../components/Toast/Toast';
import { useAuth } from '../../../context/AuthContext';
import './HomepageManager.css';

const DEFAULT_SLIDES = [
    {
        title: 'Medicinal Herbs', subtitle: 'NATURAL HEALING', slug: 'medicinal-herbs',
        description: 'Ancient Himalayan herbs for natural wellness and vitality', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Natural Cosmetics', subtitle: 'PURE BEAUTY', slug: 'cosmetics',
        description: 'Organic skincare crafted with nature\'s finest ingredients', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Essential Oils', subtitle: 'PURE AROMATHERAPY', slug: 'essential-oils',
        description: 'Premium botanical extracts for wellness and relaxation', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Herbal Oils', subtitle: 'THERAPEUTIC WELLNESS', slug: 'herbal-oils',
        description: 'Cold-pressed natural oils for health and vitality', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Organic Spices', subtitle: 'PURE & NATURAL', slug: 'spices',
        description: 'Authentic spices sourced from organic farms', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Superfoods', subtitle: 'NUTRIENT RICH', slug: 'superfoods',
        description: 'Power-packed organic superfoods for optimal health', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Sara Nursery', subtitle: 'GREEN LIVING', slug: 'nursery',
        description: 'Healthy plants for your home and garden', accentColor: '#8B4513',
        products: [null, null, null]
    },
    {
        title: 'Spiritual', subtitle: 'SACRED ESSENTIALS', slug: 'spiritual-items',
        description: 'Traditional spiritual items for meditation and prayer', accentColor: '#8B4513',
        products: [null, null, null]
    }
];

const DEFAULT_TRENDING_MAP = {
    'medicinal-herbs': [],
    'cosmetics': [],
    'essential-oils': [],
    'herbal-oils': [],
    'spices': [],
    'superfoods': [],
    'nursery': [],
    'spiritual-items': []
};

const HomepageManager = () => {
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [trendingProductsMap, setTrendingProductsMap] = useState(DEFAULT_TRENDING_MAP);
    const { token } = useAuth();
    
    const [activeTab, setActiveTab] = useState('hero'); // 'hero' | 'trending'
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [allProducts, setAllProducts] = useState([]);
    
    // Modal states for Hero
    const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(-1);
    const [tempSelectedHeroProducts, setTempSelectedHeroProducts] = useState([]);
    
    // Modal states for Trending
    const [isTrendingModalOpen, setIsTrendingModalOpen] = useState(false);
    const [currentTrendingCat, setCurrentTrendingCat] = useState('');
    const [tempSelectedTrending, setTempSelectedTrending] = useState([]);
    
    const [toast, setToast] = useState({ message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products
                const prodRes = await fetch('http://localhost:5000/api/products');
                const productsData = await prodRes.json();
                setAllProducts(productsData);

                // Fetch config
                const configRes = await fetch('http://localhost:5000/api/hero-config');
                const configData = await configRes.json();
                
                if (configData && configData.slides && configData.slides.length > 0) {
                    setSlides(configData.slides);
                }

                // Fetch trending config
                const trendingRes = await fetch('http://localhost:5000/api/trending-config');
                const trendingData = await trendingRes.json();
                
                if (trendingData && trendingData.length === 9) {
                    const newMap = { ...DEFAULT_TRENDING_MAP };
                    trendingData.forEach(prod => {
                        // Backend might return populated product or just ID. We need the category slug.
                        // Assuming populated because of how we updated the API earlier, but let's be safe.
                        const productObj = typeof prod === 'object' && prod.categorySlug ? prod : productsData.find(p => p._id === (prod._id || prod));
                        if (productObj && productObj.categorySlug) {
                            newMap[productObj.categorySlug] = [...(newMap[productObj.categorySlug] || []), productObj];
                        }
                    });
                    setTrendingProductsMap(newMap);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                showToast("Failed to load configuration", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        if (activeTab === 'hero') {
            for (const slide of slides) {
                const productCount = slide.products.filter(slot => slot && slot.product).length;
                if (productCount > 0 && productCount < 3) {
                    showToast(`Please select exactly 3 products for "${slide.title}", or leave it empty.`, 'error');
                    return;
                }
            }

            setIsSaving(true);
            try {
                const payloadSlides = slides.map(slide => {
                    const hasProducts = slide.products.some(slot => slot && slot.product);
                    return {
                        ...slide,
                        products: hasProducts ? slide.products : []
                    };
                });

                const res = await fetch('http://localhost:5000/api/hero-config', {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ slides: payloadSlides })
                });
                
                if (!res.ok) throw new Error('Failed to save Hero configuration');
                
                showToast('Hero configuration saved successfully!');
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                setIsSaving(false);
            }
        } else if (activeTab === 'trending') {
            const allSelected = Object.values(trendingProductsMap).flat();
            if (allSelected.length !== 9) {
                showToast(`Please select exactly 9 products. You have selected ${allSelected.length}.`, 'error');
                return;
            }

            const hasEmptyCategory = Object.values(trendingProductsMap).some(arr => arr.length === 0);

            if (hasEmptyCategory) {
                showToast('Category distribution invalid. You must select at least 1 product from every category.', 'error');
                return;
            }

            setIsSaving(true);
            try {
                const payloadProducts = allSelected.map(p => p._id);

                const res = await fetch('http://localhost:5000/api/trending-config', {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ products: payloadProducts })
                });
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to save Trending configuration');
                }
                
                showToast('Trending configuration saved successfully!');
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                setIsSaving(false);
            }
        }
    };

    const openHeroProductPicker = (slideIndex) => {
        setCurrentSlideIndex(slideIndex);
        const existingSelections = slides[slideIndex].products
            .filter(slot => slot && slot.product)
            .map(slot => typeof slot.product === 'object' ? slot.product._id : slot.product);
            
        setTempSelectedHeroProducts(existingSelections);
        setIsHeroModalOpen(true);
    };

    const toggleHeroProductSelection = (productId) => {
        setTempSelectedHeroProducts(prev => {
            if (prev.includes(productId)) return prev.filter(id => id !== productId);
            if (prev.length >= 3) {
                showToast('You can only select up to 3 products', 'error');
                return prev;
            }
            return [...prev, productId];
        });
    };

    const handleConfirmHeroSelection = () => {
        if (tempSelectedHeroProducts.length !== 3) {
            showToast('Please select exactly 3 products', 'error');
            return;
        }

        const newSlides = [...slides];
        const labels = ['Natural Herbal', 'Natural Herbal', 'SARA PREMIUM'];
        
        newSlides[currentSlideIndex].products = tempSelectedHeroProducts.map((productId, index) => {
            const product = allProducts.find(p => p._id === productId);
            return {
                product: product._id,
                label: labels[index],
                _tempDisplay: {
                    name: product.name,
                    image: product.images?.[0] || '/assets/images/placeholder.png'
                }
            };
        });
        
        setSlides(newSlides);
        setIsHeroModalOpen(false);
    };

    const getAvailableProductsForCurrentSlide = () => {
        if (currentSlideIndex === -1) return [];
        const slideCategory = slides[currentSlideIndex].slug;
        return allProducts.filter(p => p.categorySlug === slideCategory);
    };

    const openTrendingProductPicker = (categorySlug) => {
        setCurrentTrendingCat(categorySlug);
        setTempSelectedTrending(trendingProductsMap[categorySlug].map(p => p._id));
        setIsTrendingModalOpen(true);
    };

    const toggleTrendingProductSelection = (productId) => {
        setTempSelectedTrending(prev => {
            if (prev.includes(productId)) return prev.filter(id => id !== productId);
            
            const hasBonusSlotElsewhere = Object.entries(trendingProductsMap)
                .some(([slug, arr]) => slug !== currentTrendingCat && arr.length > 1);
                
            const maxAllowed = hasBonusSlotElsewhere ? 1 : 2;
            
            if (prev.length >= maxAllowed) {
                showToast(`You can only select up to ${maxAllowed} product(s) for this category.`, 'warning');
                return prev;
            }

            // Check overall limit across all categories
            const otherCategoriesSelected = Object.entries(trendingProductsMap)
                .filter(([slug]) => slug !== currentTrendingCat)
                .reduce((acc, [_, arr]) => acc + arr.length, 0);

            if (otherCategoriesSelected + prev.length >= 9) {
                showToast(`You have reached the maximum of 9 trending products overall. Uncheck a product in another category first.`, 'warning');
                return prev;
            }

            return [...prev, productId];
        });
    };

    const handleConfirmTrendingSelection = () => {
        const newMap = { ...trendingProductsMap };
        newMap[currentTrendingCat] = tempSelectedTrending.map(id => allProducts.find(p => p._id === id));
        setTrendingProductsMap(newMap);
        setIsTrendingModalOpen(false);
    };

    const getAvailableProductsForTrendingCat = () => {
        if (!currentTrendingCat) return [];
        return allProducts.filter(p => p.categorySlug === currentTrendingCat);
    };

    return (
        <AdminLayout>
            <div className="homepage-manager">
                <div className="homepage-manager-header">
                    <div>
                        <h1>Home Page Manager</h1>
                        <div className="hm-tabs">
                            <button 
                                className={`hm-tab ${activeTab === 'hero' ? 'active' : ''}`}
                                onClick={() => setActiveTab('hero')}
                            >
                                Hero Banners
                            </button>
                            <button 
                                className={`hm-tab ${activeTab === 'trending' ? 'active' : ''}`}
                                onClick={() => setActiveTab('trending')}
                            >
                                Trending Products
                            </button>
                        </div>
                    </div>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSave}
                        disabled={isSaving || isLoading}
                    >
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading-state">Loading configuration...</div>
                ) : (
                    <>
                        {activeTab === 'hero' && (
                            <div className="hm-slides-grid">
                                {slides.map((slide, slideIndex) => {
                                    const hasProducts = slide.products.some(slot => slot && slot.product);
                                    return (
                                        <div className="hm-slide-card" key={slide.slug || slideIndex}>
                                            <div className="hm-slide-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <h3>{slide.title}</h3>
                                                    <p>{slide.subtitle}</p>
                                                </div>
                                                <button 
                                                    className="btn-select-products"
                                                    onClick={() => openHeroProductPicker(slideIndex)}
                                                >
                                                    {hasProducts ? 'Edit Products' : 'Add Products'}
                                                </button>
                                            </div>
                                            <div className="hm-product-slots">
                                                {[0, 1, 2].map(slotIndex => {
                                                    const slotData = slide.products[slotIndex];
                                                    const displayProduct = slotData && slotData.product && typeof slotData.product === 'object' 
                                                        ? slotData.product 
                                                        : slotData?._tempDisplay;

                                                    return (
                                                        <div 
                                                            className="hm-product-slot" 
                                                            key={slotIndex}
                                                            onClick={() => openHeroProductPicker(slideIndex)}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                        {displayProduct ? (
                                                            <>
                                                                <img 
                                                                    src={displayProduct.images?.[0] || displayProduct.image || '/assets/images/placeholder.png'} 
                                                                    alt={displayProduct.name} 
                                                                    className="hm-slot-image" 
                                                                />
                                                                <div className="hm-slot-info">
                                                                    <div className="hm-slot-name">{displayProduct.name}</div>
                                                                    <div className="hm-slot-label">{slotData.label}</div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <div className="hm-slot-empty">+</div>
                                                                <div className="hm-slot-placeholder">Empty Slot</div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {activeTab === 'trending' && (
                            <div className="hm-trending-section-new">
                                <div className="hm-trending-instructions">
                                    <p>Select exactly 9 trending products for the homepage grid.</p>
                                    <p><strong>Rule:</strong> You must select at least 1 product from each of the 8 categories. Only ONE category can have 2 products.</p>
                                </div>
                                
                                <div className="hm-slides-grid">
                                    {DEFAULT_SLIDES.map((category) => {
                                        const selectedForCat = trendingProductsMap[category.slug] || [];
                                        const totalSelectedAcrossAll = Object.values(trendingProductsMap).flat().length;
                                        const hasBonusSlotElsewhere = Object.values(trendingProductsMap).some(arr => arr.length > 1);
                                        
                                        return (
                                            <div className="hm-slide-card" key={category.slug}>
                                                <div className="hm-slide-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h3>{category.title}</h3>
                                                        <p style={{ color: selectedForCat.length > 0 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                                                            {selectedForCat.length} product(s) selected
                                                        </p>
                                                    </div>
                                                    <button 
                                                        className="btn-select-products"
                                                        onClick={() => openTrendingProductPicker(category.slug)}
                                                    >
                                                        {selectedForCat.length > 0 ? 'Edit Products' : 'Add Products'}
                                                    </button>
                                                </div>
                                                
                                                <div className="hm-product-slots">
                                                    {selectedForCat.map((product, idx) => (
                                                        <div className="hm-product-slot" key={product._id || idx} onClick={() => openTrendingProductPicker(category.slug)} style={{ cursor: 'pointer' }}>
                                                             <img src={product.images?.[0] || '/assets/images/placeholder.png'} className="hm-slot-image" alt={product.name} />
                                                             <div className="hm-slot-info">
                                                                 <div className="hm-slot-name">{product.name}</div>
                                                                 <div className="hm-slot-label">Trending</div>
                                                             </div>
                                                        </div>
                                                    ))}
                                                    
                                                    {selectedForCat.length === 0 && (
                                                        <div className="hm-product-slot" onClick={() => openTrendingProductPicker(category.slug)} style={{ cursor: 'pointer' }}>
                                                             <div className="hm-slot-empty">+</div>
                                                             <div className="hm-slot-placeholder">Required Slot</div>
                                                        </div>
                                                    )}
                                                    
                                                    {selectedForCat.length === 1 && !hasBonusSlotElsewhere && totalSelectedAcrossAll < 9 && (
                                                        <div className="hm-product-slot" onClick={() => openTrendingProductPicker(category.slug)} style={{ opacity: 0.6, borderStyle: 'dashed', cursor: 'pointer' }}>
                                                             <div className="hm-slot-empty" style={{ fontSize: '1.2rem' }}>+</div>
                                                             <div className="hm-slot-placeholder">Optional Bonus Slot</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isHeroModalOpen && (
                <div className="hm-modal-overlay" onClick={() => setIsHeroModalOpen(false)}>
                    <div className="hm-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="hm-modal-header">
                            <div>
                                <h3>Select Products for {slides[currentSlideIndex]?.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Select exactly 3 products ({tempSelectedHeroProducts.length}/3 selected)
                                </p>
                            </div>
                            <button className="btn-close" onClick={() => setIsHeroModalOpen(false)}>&times;</button>
                        </div>
                        <div className="hm-modal-body">
                            {getAvailableProductsForCurrentSlide().length === 0 ? (
                                <p>No products found in this category. Add some products first!</p>
                            ) : (
                                <div className="hm-product-list">
                                    {getAvailableProductsForCurrentSlide().map(product => {
                                        const isSelected = tempSelectedHeroProducts.includes(product._id);
                                        return (
                                            <div 
                                                className={`hm-product-item ${isSelected ? 'selected' : ''}`} 
                                                key={product._id}
                                                onClick={() => toggleHeroProductSelection(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="hm-product-item-info">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        style={{ marginRight: '10px' }}
                                                    />
                                                    <img src={product.images?.[0] || '/assets/images/placeholder.png'} alt={product.name} />
                                                    <div>
                                                        <div style={{fontWeight: 500}}>{product.name}</div>
                                                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                            Rs. {product.discountPrice || product.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="hm-modal-footer" style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn" onClick={() => setIsHeroModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleConfirmHeroSelection}
                                disabled={tempSelectedHeroProducts.length !== 3}
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isTrendingModalOpen && (
                <div className="hm-modal-overlay" onClick={() => setIsTrendingModalOpen(false)}>
                    <div className="hm-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="hm-modal-header">
                            <div>
                                <h3>Select Trending for {DEFAULT_SLIDES.find(c => c.slug === currentTrendingCat)?.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    {tempSelectedTrending.length} selected
                                </p>
                            </div>
                            <button className="btn-close" onClick={() => setIsTrendingModalOpen(false)}>&times;</button>
                        </div>
                        <div className="hm-modal-body">
                            {getAvailableProductsForTrendingCat().length === 0 ? (
                                <p>No products found in this category.</p>
                            ) : (
                                <div className="hm-product-list">
                                    {getAvailableProductsForTrendingCat().map(product => {
                                        const isSelected = tempSelectedTrending.includes(product._id);
                                        return (
                                            <div 
                                                className={`hm-product-item ${isSelected ? 'selected' : ''}`} 
                                                key={product._id}
                                                onClick={() => toggleTrendingProductSelection(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="hm-product-item-info">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => {}}
                                                        style={{ marginRight: '10px' }}
                                                    />
                                                    <img src={product.images?.[0] || '/assets/images/placeholder.png'} alt={product.name} />
                                                    <div>
                                                        <div style={{fontWeight: 500}}>{product.name}</div>
                                                        <div style={{fontSize: '0.8rem', color: '#666'}}>
                                                            Rs. {product.discountPrice || product.price}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="hm-modal-footer" style={{ padding: 'var(--space-md) var(--space-lg)', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button className="btn" onClick={() => setIsTrendingModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleConfirmTrendingSelection}
                            >
                                Confirm Selection
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast.message && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast({ message: '', type: 'success' })} 
                />
            )}
        </AdminLayout>
    );
};

export default HomepageManager;
