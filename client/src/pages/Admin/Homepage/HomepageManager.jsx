import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/AdminLayout/AdminLayout';
import Toast from '../../../components/Toast/Toast';
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

const HomepageManager = () => {
    const [slides, setSlides] = useState(DEFAULT_SLIDES);
    const [trendingProducts, setTrendingProducts] = useState(Array(9).fill(null));
    
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
    const [currentTrendingSlotIndex, setCurrentTrendingSlotIndex] = useState(-1);
    
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
                    setTrendingProducts(trendingData);
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
            // Validate: each slide must be either completely empty or have exactly 3 products
            for (const slide of slides) {
                const productCount = slide.products.filter(slot => slot && slot.product).length;
                if (productCount > 0 && productCount < 3) {
                    showToast(`Please select exactly 3 products for "${slide.title}", or leave it empty.`, 'error');
                    return;
                }
            }

            setIsSaving(true);
            try {
                // Filter out nulls/empty for the backend
                const payloadSlides = slides.map(slide => {
                    const hasProducts = slide.products.some(slot => slot && slot.product);
                    return {
                        ...slide,
                        products: hasProducts ? slide.products : []
                    };
                });

                const res = await fetch('http://localhost:5000/api/hero-config', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
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
            const selectedCount = trendingProducts.filter(p => p !== null).length;
            if (selectedCount !== 9) {
                showToast(`Please select exactly 9 products. You have selected ${selectedCount}.`, 'error');
                return;
            }

            // Validate category constraint: 7 categories with 1, 1 category with 2
            const categoryCounts = {};
            trendingProducts.forEach(productInfo => {
                if (!productInfo) return;
                // We stored either full product object or just an ID with _tempDisplay.
                // Let's assume we fetch full product object into state or lookup by ID.
                const product = typeof productInfo === 'object' && productInfo.categorySlug ? 
                    productInfo : 
                    allProducts.find(p => p._id === (productInfo._id || productInfo));
                
                if (product) {
                    categoryCounts[product.categorySlug] = (categoryCounts[product.categorySlug] || 0) + 1;
                }
            });

            const counts = Object.values(categoryCounts);
            const hasOneWithTwo = counts.filter(c => c === 2).length === 1;
            const hasSevenWithOne = counts.filter(c => c === 1).length === 7;

            if (!hasOneWithTwo || !hasSevenWithOne) {
                showToast('Category distribution invalid. Must have exactly 1 category with 2 products, and 7 categories with 1 product.', 'error');
                return;
            }

            setIsSaving(true);
            try {
                const payloadProducts = trendingProducts.map(p => p._id || p);

                const res = await fetch('http://localhost:5000/api/trending-config', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
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

    const openProductPicker = (slideIndex) => {
        setCurrentSlideIndex(slideIndex);
        
        // Pre-fill with existing selections for this slide
        const existingSelections = slides[slideIndex].products
            .filter(slot => slot && slot.product)
            .map(slot => typeof slot.product === 'object' ? slot.product._id : slot.product);
            
        setTempSelectedProducts(existingSelections);
        setIsModalOpen(true);
    };

    const toggleProductSelection = (productId) => {
        setTempSelectedProducts(prev => {
            if (prev.includes(productId)) {
                return prev.filter(id => id !== productId);
            }
            if (prev.length >= 3) {
                showToast('You can only select up to 3 products', 'error');
                return prev;
            }
            return [...prev, productId];
        });
    };

    const handleConfirmSelection = () => {
        if (tempSelectedProducts.length !== 3) {
            showToast('Please select exactly 3 products', 'error');
            return;
        }

        const newSlides = [...slides];
        const labels = ['Natural Herbal', 'Natural Herbal', 'SARA PREMIUM'];
        
        newSlides[currentSlideIndex].products = tempSelectedProducts.map((productId, index) => {
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
        setIsModalOpen(false);
    };

    // Filter products by current slide category for the modal
    const getAvailableProductsForCurrentSlide = () => {
        if (currentSlideIndex === -1) return [];
        const slideCategory = slides[currentSlideIndex].slug;
        return allProducts.filter(p => p.categorySlug === slideCategory);
    };

    return (
        <AdminLayout>
            <div className="homepage-manager">
                <div className="homepage-manager-header">
                    <h1>Home Page Manager</h1>
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
                                            onClick={() => openProductPicker(slideIndex)}
                                        >
                                            {hasProducts ? 'Edit Products' : 'Add Products'}
                                        </button>
                                    </div>
                                    <div className="hm-product-slots">
                                        {[0, 1, 2].map(slotIndex => {
                                            const slotData = slide.products[slotIndex];
                                            // Product data might be populated from backend OR temporarily stored during selection
                                            const displayProduct = slotData && slotData.product && typeof slotData.product === 'object' 
                                                ? slotData.product 
                                                : slotData?._tempDisplay;

                                            return (
                                                <div 
                                                    className="hm-product-slot" 
                                                    key={slotIndex}
                                                    onClick={() => openProductPicker(slideIndex)}
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
            </div>

            {/* Product Picker Modal */}
            {isModalOpen && (
                <div className="hm-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="hm-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="hm-modal-header">
                            <div>
                                <h3>Select Products for {slides[currentSlideIndex]?.title}</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                                    Select exactly 3 products ({tempSelectedProducts.length}/3 selected)
                                </p>
                            </div>
                            <button className="btn-close" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <div className="hm-modal-body">
                            {getAvailableProductsForCurrentSlide().length === 0 ? (
                                <p>No products found in this category. Add some products first!</p>
                            ) : (
                                <div className="hm-product-list">
                                    {getAvailableProductsForCurrentSlide().map(product => {
                                        const isSelected = tempSelectedProducts.includes(product._id);
                                        return (
                                            <div 
                                                className={`hm-product-item ${isSelected ? 'selected' : ''}`} 
                                                key={product._id}
                                                onClick={() => toggleProductSelection(product._id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <div className="hm-product-item-info">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={isSelected}
                                                        onChange={() => {}} // Handled by parent div click
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
                            <button className="btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button 
                                className="btn btn-primary" 
                                onClick={handleConfirmSelection}
                                disabled={tempSelectedProducts.length !== 3}
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
