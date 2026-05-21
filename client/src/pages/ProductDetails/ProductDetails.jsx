import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Toast from '../../components/Toast/Toast';
import { allProducts } from '../../data/productsData';
import './ProductDetails.css';

// Helper to generate SEO-friendly JSON-LD structured data
const generateProductJsonLd = (product, categoryName) => {
    if (!product) return null;

    const price = product.discountPrice || product.price;
    const originalPrice = product.discountPrice ? product.price : null;

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        image: product.images?.map(img => `${window.location.origin}${img}`) || [],
        sku: product.slug,
        brand: {
            '@type': 'Brand',
            name: 'SARA Herbal Company',
        },
        category: categoryName || '',
        offers: {
            '@type': 'Offer',
            url: window.location.href,
            priceCurrency: 'NPR',
            price: price,
            ...(originalPrice && { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
            availability: product.inStock !== false
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'SARA Herbal Company',
            },
        },
        ...(product.ingredients?.length > 0 && {
            additionalProperty: product.ingredients.map(ingredient => ({
                '@type': 'PropertyValue',
                name: 'Ingredient',
                value: ingredient,
            })),
        }),
        ...(product.ratings?.count > 0 && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.ratings.average,
                reviewCount: product.ratings.count,
            }
        }),
    };
};

// Generate BreadcrumbList JSON-LD
const generateBreadcrumbJsonLd = (product, categoryName, categorySlug) => {
    if (!product) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: window.location.origin,
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: `${window.location.origin}/products`,
            },
            ...(categoryName
                ? [
                      {
                          '@type': 'ListItem',
                          position: 3,
                          name: categoryName,
                          item: `${window.location.origin}/products?category=${categorySlug}`,
                      },
                  ]
                : []),
            {
                '@type': 'ListItem',
                position: categoryName ? 4 : 3,
                name: product.name,
                item: window.location.href,
            },
        ],
    };
};

const formatPrice = (price) => {
    if (!price && price !== 0) return '';
    return `Rs. ${price.toLocaleString()}`;
};

const categoryLabels = {
    'medicinal-herbs': 'Medicinal Herbs',
    'essential-oils': 'Natural Essential Oils',
    'herbal-oils': 'Natural Herbal Oils',
    superfoods: 'Natural Organic Super Foods',
    cosmetics: 'Natural Cosmetics',
    spices: 'Natural Organic Spices',
    'spiritual-items': 'Spiritual Items',
    nursery: 'Sara Nursery',
};

const ProductDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('description');
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [quantity, setQuantity] = useState(1);
    
    // Missing states
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    
    const { user, token } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [recentlyViewed, setRecentlyViewed] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Fetch product data — tries API first, falls back to local data
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            setQuantity(1);
            setSelectedImageIndex(0);
            setActiveTab('description');

            try {
                const response = await fetch(`${API_URL}/products/${slug}`);
                if (!response.ok) throw new Error('API error');
                const data = await response.json();
                setProduct(data);

                if (data.variants && data.variants.length > 0) {
                    setSelectedVariant(data.variants[0]);
                } else {
                    setSelectedVariant(null);
                }

                if (data._id) {
                    const reviewsRes = await fetch(`${API_URL}/products/${data._id}/reviews`);
                    if (reviewsRes.ok) {
                        const revData = await reviewsRes.json();
                        setReviews(revData);
                        
                        // Check if current user already reviewed
                        if (user) {
                            const existingReview = revData.find(r => r.user === user._id || r.userName === user.name);
                            if (existingReview) {
                                setNewReview({ rating: existingReview.rating, comment: existingReview.comment });
                            }
                        }
                    }
                }

                // Fetch related products from the same category
                const catSlug = data.categorySlug;
                if (catSlug) {
                    const relatedRes = await fetch(`${API_URL}/products?category=${catSlug}&limit=5`);
                    if (relatedRes.ok) {
                        const relatedData = await relatedRes.json();
                        setRelatedProducts(relatedData.filter((p) => p.slug !== slug).slice(0, 4));
                    }
                }
            } catch {
                // Fallback to local data
                const localProduct = allProducts.find((p) => p.slug === slug);
                if (localProduct) {
                    setProduct(localProduct);
                    setRelatedProducts(
                        allProducts
                            .filter((p) => p.categorySlug === localProduct.categorySlug && p.slug !== slug)
                            .slice(0, 4)
                    );
                    setError(null);
                } else {
                    setError('Product not found');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [slug, API_URL]);

    // SEO: Update document title and meta tags
    useEffect(() => {
        if (product) {
            const categoryName = categoryLabels[product.categorySlug] || '';
            document.title = `${product.name} - ${categoryName} | SARA Herbal Company`;

            // Update meta description
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute(
                    'content',
                    product.shortDescription || product.description?.substring(0, 160)
                );
            }

            // Update meta keywords
            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (metaKeywords) {
                const keywords = [
                    product.name,
                    categoryName,
                    'organic',
                    'herbal',
                    'natural',
                    'Nepal',
                    ...(product.ingredients || []),
                ].join(', ');
                metaKeywords.setAttribute('content', keywords);
            }

            // Set or update Open Graph tags
            setMetaTag('og:title', `${product.name} | SARA Herbal Company`);
            setMetaTag('og:description', product.shortDescription || product.description?.substring(0, 200));
            setMetaTag('og:image', product.images?.[0] ? `${window.location.origin}${product.images[0]}` : '');
            setMetaTag('og:url', window.location.href);
            setMetaTag('og:type', 'product');
            setMetaTag('og:site_name', 'SARA Herbal Company');

            // Twitter Card tags
            setMetaTag('twitter:card', 'summary_large_image');
            setMetaTag('twitter:title', `${product.name} | SARA Herbal`);
            setMetaTag('twitter:description', product.shortDescription || product.description?.substring(0, 200));
            setMetaTag('twitter:image', product.images?.[0] ? `${window.location.origin}${product.images[0]}` : '');

            // Canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.setAttribute('rel', 'canonical');
                document.head.appendChild(canonical);
            }
            canonical.setAttribute('href', `${window.location.origin}/products/${product.slug}`);
        }

        // Cleanup
        return () => {
            document.title = 'SARA - Pure Herbal Products from Nepal';
            const metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
                metaDesc.setAttribute(
                    'content',
                    "SARA Herbal Company - Pure organic herbal products, essential oils, superfoods, and natural cosmetics from Nepal's finest sources."
                );
            }
        };
    }, [product]);

    // Helper to set or create meta tags
    const setMetaTag = (property, content) => {
        let element = document.querySelector(`meta[property="${property}"]`) ||
            document.querySelector(`meta[name="${property}"]`);
        if (!element) {
            element = document.createElement('meta');
            if (property.startsWith('og:')) {
                element.setAttribute('property', property);
            } else {
                element.setAttribute('name', property);
            }
            document.head.appendChild(element);
        }
        element.setAttribute('content', content || '');
    };

    // Computed values
    const categoryName = product ? categoryLabels[product.categorySlug] || '' : '';
    
    const displayPrice = selectedVariant 
        ? (selectedVariant.discountPrice || selectedVariant.price) 
        : (product ? (product.discountPrice || product.price) : 0);
        
    const originalDisplayPrice = selectedVariant
        ? (selectedVariant.discountPrice ? selectedVariant.price : null)
        : (product ? (product.discountPrice ? product.price : null) : null);
        
    const hasDiscount = !!originalDisplayPrice;
    const discountPercent = hasDiscount
        ? Math.round(((originalDisplayPrice - displayPrice) / originalDisplayPrice) * 100)
        : 0;
        
    const displayStock = selectedVariant 
        ? selectedVariant.stock 
        : (product ? product.stock : 0);
        
    const isInStock = displayStock > 0;
    
    const totalSold = product?.totalSold || 0;
    const ratingValue = product?.ratings?.average || 0;
    const reviewCount = product?.ratings?.count || 0;

    // Recently Viewed Logic
    useEffect(() => {
        if (!product) return;
        try {
            const stored = JSON.parse(localStorage.getItem('sara_recently_viewed') || '[]');
            const filtered = stored.filter(p => p.slug !== product.slug);
            const updated = [{
                slug: product.slug,
                name: product.name,
                image: product.images?.[0] || '/assets/images/placeholder.png',
                price: product.discountPrice || product.price,
                originalPrice: product.discountPrice ? product.price : null
            }, ...filtered].slice(0, 6);
            localStorage.setItem('sara_recently_viewed', JSON.stringify(updated));
            setRecentlyViewed(updated.filter(p => p.slug !== product.slug));
        } catch (e) {
            console.error(e);
        }
    }, [product]);

    // Review Submit Handler
    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newReview.rating) {
            setToast({ message: 'Please select a rating', type: 'error' });
            return;
        }
        if (!user || !token) {
            setToast({ message: 'You must be logged in to review', type: 'error' });
            return;
        }
        
        setIsSubmittingReview(true);
        try {
            const res = await fetch(`${API_URL}/products/${product._id}/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newReview)
            });
            if (res.ok) {
                const addedReview = await res.json();
                
                // If it was an update, replace the existing review
                const existingIndex = reviews.findIndex(r => r._id === addedReview._id);
                if (existingIndex !== -1) {
                    const updatedReviews = [...reviews];
                    updatedReviews[existingIndex] = addedReview;
                    setReviews(updatedReviews);
                    setToast({ message: 'Review updated successfully!', type: 'success' });
                } else {
                    setReviews([addedReview, ...reviews]);
                    setToast({ message: 'Review submitted successfully!', type: 'success' });
                }
                
                // Fetch fresh product data to get the updated average rating
                const prodRes = await fetch(`${API_URL}/products/${product.slug}`);
                if (prodRes.ok) {
                    const prodData = await prodRes.json();
                    setProduct(prodData);
                }
            } else {
                const errData = await res.json();
                setToast({ message: errData.message || 'Failed to submit review', type: 'error' });
            }
        } catch (error) {
            setToast({ message: 'Server error. Please try again later.', type: 'error' });
            console.error(error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleShare = async () => {
        const shareData = { title: product?.name, text: product?.shortDescription, url: window.location.href };
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            setIsShareOpen(!isShareOpen);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isShareOpen && !e.target.closest('.pdp-share-container')) setIsShareOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isShareOpen]);

    // JSON-LD structured data
    const productJsonLd = useMemo(() => generateProductJsonLd(product, categoryName), [product, categoryName]);
    const breadcrumbJsonLd = useMemo(
        () => generateBreadcrumbJsonLd(product, categoryName, product?.categorySlug),
        [product, categoryName]
    );

    // Tabs data
    const tabs = [
        { id: 'description', label: 'Description' },
        { id: 'benefits', label: 'Benefits' },
        { id: 'howToUse', label: 'How to Use' },
        { id: 'ingredients', label: 'Ingredients' },
        { id: 'reviews', label: `Reviews (${reviewCount})` }
    ];

    if (loading) {
        return (
            <div className="product-details-page">
                <Navbar />
                <main className="product-details-main">
                    <div className="container">
                        <div className="pdp-loading">
                            <div className="pdp-spinner"></div>
                            <p>Loading product details...</p>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="product-details-page">
                <Navbar />
                <main className="product-details-main">
                    <div className="container">
                        <div className="pdp-error">
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-text-muted)' }}>
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                            <h2>Product Not Found</h2>
                            <p>Sorry, we couldn't find the product you're looking for.</p>
                            <Link to="/products" className="btn btn-primary">
                                Browse All Products
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="product-details-page">
            <Navbar />

            {/* SEO: JSON-LD Structured Data */}
            {productJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
                />
            )}
            {breadcrumbJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
                />
            )}

            <main className="product-details-main" role="main">
                <div className="container">
                    {/* SEO: Breadcrumb Navigation */}
                    <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
                        <Link to="/">Home</Link>
                        <span className="breadcrumb-separator" aria-hidden="true">›</span>
                        <Link to="/products">Products</Link>
                        {categoryName && (
                            <>
                                <span className="breadcrumb-separator" aria-hidden="true">›</span>
                                <Link to={`/products?category=${product.categorySlug}`}>{categoryName}</Link>
                            </>
                        )}
                        <span className="breadcrumb-separator" aria-hidden="true">›</span>
                        <span className="breadcrumb-current" aria-current="page">{product.name}</span>
                    </nav>

                    {/* Product Main Section */}
                    <article className="pdp-layout" itemScope itemType="https://schema.org/Product">
                        {/* Image Gallery */}
                        <section className="pdp-gallery" aria-label="Product images">
                            <div className="pdp-main-image">
                                <div className="pdp-image-badge">
                                    {product.isNew && <span className="badge-tag new">New</span>}
                                    {product.isBestseller && <span className="badge-tag bestseller">Bestseller</span>}
                                    {hasDiscount && <span className="badge-tag sale">-{discountPercent}%</span>}
                                    {totalSold > 0 && <span className="badge-tag sold">{totalSold} Sold</span>}
                                </div>
                                <img
                                    src={product.images?.[selectedImageIndex] || product.images?.[0]}
                                    alt={`${product.name} - ${product.shortDescription || categoryName}`}
                                    itemProp="image"
                                    loading="eager"
                                />
                            </div>

                            {product.images?.length > 1 && (
                                <div className="pdp-thumbnails" role="tablist" aria-label="Product image thumbnails">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            className={`pdp-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                                            onClick={() => setSelectedImageIndex(index)}
                                            role="tab"
                                            aria-selected={selectedImageIndex === index}
                                            aria-label={`View image ${index + 1}`}
                                        >
                                            <img src={img} alt={`${product.name} thumbnail ${index + 1}`} loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Product Information */}
                        <section className="pdp-info">
                            {/* Category Link */}
                            <Link
                                to={`/products?category=${product.categorySlug}`}
                                className="pdp-category-link"
                                aria-label={`Browse ${categoryName} category`}
                            >
                                {categoryName}
                            </Link>

                            {/* SEO: H1 Product Title */}
                            <h1 className="pdp-title" itemProp="name">{product.name}</h1>

                            {/* Ratings Display */}
                            <div className="pdp-ratings-summary" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                <div className="stars" style={{ color: '#F59E0B', display: 'flex', fontSize: '1.2rem' }}>
                                    {[1,2,3,4,5].map(star => (
                                        <span key={star}>{star <= Math.round(ratingValue) ? '★' : '☆'}</span>
                                    ))}
                                </div>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                    {ratingValue.toFixed(1)} ({reviewCount} reviews)
                                </span>
                            </div>

                            {/* Short Description */}
                            <p className="pdp-short-desc" itemProp="description">
                                {product.shortDescription}
                            </p>

                            {/* Price Block */}
                            <div className="pdp-price-block" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                <meta itemProp="priceCurrency" content="NPR" />
                                <meta itemProp="price" content={displayPrice} />
                                <span className="pdp-current-price">{formatPrice(displayPrice)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="pdp-original-price">{formatPrice(originalDisplayPrice)}</span>
                                        <span className="pdp-discount-percent">-{discountPercent}% OFF</span>
                                    </>
                                )}
                                <link
                                    itemProp="availability"
                                    href={
                                        isInStock
                                            ? 'https://schema.org/InStock'
                                            : 'https://schema.org/OutOfStock'
                                    }
                                />
                            </div>

                            {/* Variant Selector */}
                            {product.variants && product.variants.length > 0 && (
                                <div className="pdp-variants" style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '8px', color: 'var(--color-text-muted)' }}>Available Options:</h4>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {product.variants.map((variant, idx) => (
                                            <button 
                                                key={idx}
                                                onClick={() => setSelectedVariant(variant)}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: selectedVariant?.name === variant.name ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                                    backgroundColor: selectedVariant?.name === variant.name ? 'var(--color-cream)' : 'transparent',
                                                    color: selectedVariant?.name === variant.name ? 'var(--color-primary)' : 'var(--color-text)',
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    fontWeight: selectedVariant?.name === variant.name ? 600 : 400,
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                {variant.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className={`pdp-stock ${isInStock ? 'in-stock' : 'out-of-stock'}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <span className="stock-dot" style={{ background: isInStock ? (displayStock > 0 && displayStock < 5 ? '#F59E0B' : '#10B981') : '#EF4444' }}></span>
                                <span style={{ fontWeight: 600, color: isInStock ? (displayStock > 0 && displayStock < 5 ? '#B45309' : '#047857') : '#B91C1C' }}>
                                    {isInStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {isInStock && displayStock > 0 && displayStock < 5 ? (
                                    <span style={{ color: '#D97706', fontSize: '0.9rem', fontWeight: 600, marginLeft: '8px', padding: '2px 8px', background: '#FEF3C7', borderRadius: '12px' }}>
                                        Hurry! Only {displayStock} left
                                    </span>
                                ) : (isInStock && displayStock >= 5 ? (
                                    <span className="stock-count" style={{ color: 'var(--color-text-muted)' }}>({displayStock} available)</span>
                                ) : null)}
                            </div>

                            <hr className="pdp-divider" />

                            {/* Quantity & Add to Cart */}
                            <div className="pdp-actions">
                                <div className={`pdp-quantity ${!isInStock ? 'disabled' : ''}`} aria-label="Product quantity">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                        disabled={!isInStock}
                                    >
                                        −
                                    </button>
                                    <span aria-live="polite">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => Math.min(displayStock, q + 1))}
                                        aria-label="Increase quantity"
                                        disabled={!isInStock || quantity >= displayStock}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="pdp-add-to-cart"
                                    id="add-to-cart-btn"
                                    aria-label={`Add ${product.name} to cart`}
                                    disabled={!isInStock}
                                    onClick={async () => {
                                        const success = await addToCart(product._id, quantity);
                                        if (success) setToast({ message: 'Added to cart!', type: 'success' });
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                                        <path d="M3 6h18"></path>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    {isInStock ? 'Add to Cart' : 'Out of Stock'}
                                </button>

                                <button 
                                    className={`pdp-wishlist-btn ${isInWishlist(product?._id) ? 'active' : ''}`} 
                                    aria-label="Add to wishlist" 
                                    title="Add to Wishlist"
                                    onClick={async () => {
                                        const success = await toggleWishlist(product._id);
                                        if (success) setToast({ message: isInWishlist(product._id) ? 'Removed from wishlist' : 'Added to wishlist', type: 'success' });
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isInWishlist(product?._id) ? "var(--color-danger)" : "none"} stroke={isInWishlist(product?._id) ? "var(--color-danger)" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
                                
                                <div className="pdp-share-container" style={{ position: 'relative' }}>
                                    <button 
                                        className="pdp-share-btn pdp-wishlist-btn" 
                                        aria-label="Share product"
                                        title="Share Product"
                                        onClick={handleShare}
                                        style={{ marginLeft: '10px' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="18" cy="5" r="3"></circle>
                                            <circle cx="6" cy="12" r="3"></circle>
                                            <circle cx="18" cy="19" r="3"></circle>
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                        </svg>
                                    </button>

                                    {isShareOpen && (
                                        <div className="share-dropdown" style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '8px',
                                            background: 'white',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                            zIndex: 50,
                                            minWidth: '180px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            padding: '8px 0'
                                        }}>
                                            <a href={`https://wa.me/?text=Check out ${product.name} at ${window.location.href}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.95rem' }} className="share-dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                                WhatsApp
                                            </a>
                                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.95rem' }} className="share-dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1877F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                                Facebook
                                            </a>
                                            <a href={`https://twitter.com/intent/tweet?text=Check out ${product.name}&url=${window.location.href}`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', textDecoration: 'none', fontSize: '0.95rem' }} className="share-dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>
                                                Twitter / X
                                            </a>
                                            <div style={{ borderTop: '1px solid var(--color-border)', margin: '4px 0' }}></div>
                                            <button onClick={() => { navigator.clipboard.writeText(window.location.href); setIsShareOpen(false); setToast({ message: 'Link copied to clipboard!', type: 'success' }); }} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.95rem', width: '100%', textAlign: 'left' }} className="share-dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                                Copy Link
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div className="pdp-trust-badges">
                                <div className="trust-badge-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                    </svg>
                                    <span>100% Authentic</span>
                                </div>
                                <div className="trust-badge-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="3" width="15" height="13"></rect>
                                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                        <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                        <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                    </svg>
                                    <span>Free Shipping</span>
                                </div>
                                <div className="trust-badge-item">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                        <polyline points="17 6 23 6 23 12"></polyline>
                                    </svg>
                                    <span>Organic Certified</span>
                                </div>
                            </div>
                            
                            <div className="pdp-trust-snippets" style={{ marginTop: '16px', fontSize: '0.9rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"></rect><path d="M12 8v13"></path><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"></path><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"></path></svg>
                                    <span><strong>Easy 7-day returns</strong>. No questions asked.</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    <span>Estimated Delivery: <strong>{new Date(Date.now() + 3*24*60*60*1000).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})} - {new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}</strong></span>
                                </div>
                            </div>
                        </section>
                    </article>

                    {/* Detail Tabs Section */}
                    <section className="pdp-tabs-section" aria-label="Product details">
                        <div className="pdp-tabs-nav" role="tablist">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`pdp-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                    role="tab"
                                    aria-selected={activeTab === tab.id}
                                    aria-controls={`tab-panel-${tab.id}`}
                                    id={`tab-${tab.id}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div
                            className="pdp-tab-content"
                            role="tabpanel"
                            id={`tab-panel-${activeTab}`}
                            aria-labelledby={`tab-${activeTab}`}
                        >
                            {activeTab === 'description' && (
                                <div className="pdp-description">
                                    <p>{product.description}</p>
                                </div>
                            )}

                            {activeTab === 'benefits' && (
                                <div className="pdp-benefits-grid">
                                    {product.benefits?.map((benefit, index) => (
                                        <div className="benefit-card" key={index}>
                                            <div className="benefit-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                </svg>
                                            </div>
                                            <span>{benefit}</span>
                                        </div>
                                    ))}
                                    {(!product.benefits || product.benefits.length === 0) && (
                                        <p style={{ color: 'var(--color-text-muted)' }}>
                                            Benefit details coming soon.
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'howToUse' && (
                                <div className="pdp-how-to-use">
                                    {product.howToUse ? (
                                        <div className="use-instruction">
                                            <div className="use-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                                </svg>
                                            </div>
                                            <p>{product.howToUse}</p>
                                        </div>
                                    ) : (
                                        <p style={{ color: 'var(--color-text-muted)' }}>
                                            Usage instructions coming soon.
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'ingredients' && (
                                <div className="pdp-ingredients-list">
                                    {product.ingredients?.map((ingredient, index) => (
                                        <div className="ingredient-chip" key={index}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                                                <path d="m9 12 2 2 4-4"></path>
                                            </svg>
                                            <span>{ingredient}</span>
                                        </div>
                                    ))}
                                    {(!product.ingredients || product.ingredients.length === 0) && (
                                        <p style={{ color: 'var(--color-text-muted)' }}>
                                            Ingredient list coming soon.
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div className="pdp-reviews-container">
                                    <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--color-bg-light)', borderRadius: '12px' }}>
                                        <h3 style={{ marginBottom: '16px', fontSize: '1.2rem' }}>Write a Review</h3>
                                        
                                        {!user ? (
                                            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-white)', borderRadius: '8px' }}>
                                                <p style={{ marginBottom: '15px' }}>Please log in to share your experience with this product.</p>
                                                <Link to="/login" className="btn btn-primary">Log In to Review</Link>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleReviewSubmit}>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Rating *</label>
                                                    <div style={{ display: 'flex', gap: '8px', fontSize: '1.5rem', cursor: 'pointer' }}>
                                                        {[1,2,3,4,5].map(star => (
                                                            <span 
                                                                key={star}
                                                                onClick={() => setNewReview({...newReview, rating: star})}
                                                                style={{ color: star <= newReview.rating ? '#F59E0B' : '#D1D5DB' }}
                                                            >
                                                                ★
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Comment (Optional)</label>
                                                    <textarea 
                                                        value={newReview.comment}
                                                        onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', resize: 'vertical' }}
                                                        rows="3"
                                                        placeholder="Share your experience with this product..."
                                                    ></textarea>
                                                </div>
                                                <button 
                                                    type="submit" 
                                                    disabled={isSubmittingReview}
                                                    className="btn btn-primary"
                                                    style={{ width: '100%' }}
                                                >
                                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    <div className="pdp-reviews-list">
                                        <h3 style={{ marginBottom: '24px', fontSize: '1.2rem' }}>Customer Reviews ({reviews.length})</h3>
                                        {reviews.length === 0 ? (
                                            <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review this product!</p>
                                        ) : (
                                            reviews.map((review) => (
                                                <div key={review._id || Math.random()} style={{ padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                        <div>
                                                            <div style={{ color: '#F59E0B', fontSize: '1.1rem', marginBottom: '4px' }}>
                                                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                            </div>
                                                            <span style={{ fontWeight: 500 }}>{review.userName || 'Anonymous'}</span>
                                                        </div>
                                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                                            {new Date(review.createdAt || Date.now()).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {review.comment && (
                                                        <p style={{ color: 'var(--color-text)', marginTop: '8px', lineHeight: 1.5 }}>
                                                            {review.comment}
                                                        </p>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Recently Viewed Section */}
                    {recentlyViewed.length > 0 && (
                        <section className="pdp-related-section" aria-label="Recently viewed products" style={{ marginTop: '3rem', borderTop: '1px solid var(--color-border)', paddingTop: '2rem' }}>
                            <div className="pdp-related-header">
                                <h2>Recently Viewed</h2>
                                <p>Pick up where you left off</p>
                            </div>
                            <div className="pdp-related-grid">
                                {recentlyViewed.map((rp) => (
                                    <Link
                                        key={rp.slug}
                                        to={`/products/${rp.slug}`}
                                        className="product-card"
                                        aria-label={`View ${rp.name}`}
                                    >
                                        <div className="product-image">
                                            <img src={rp.image} alt={rp.name} loading="lazy" />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{rp.name}</h3>
                                            <div className="product-price">
                                                <span className="current-price">{formatPrice(rp.price)}</span>
                                                {rp.originalPrice && <span className="original-price">{formatPrice(rp.originalPrice)}</span>}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <section className="pdp-related-section" aria-label="Related products">
                            <div className="pdp-related-header">
                                <h2>You May Also Like</h2>
                                <p>Explore more products from {categoryName}</p>
                            </div>
                            <div className="pdp-related-grid">
                                {relatedProducts.map((rp) => (
                                    <Link
                                        to={`/products/${rp.slug}`}
                                        key={rp._id || rp.slug}
                                        className="product-card"
                                        aria-label={`View ${rp.name}`}
                                    >
                                        <div className="product-image">
                                            {rp.isNew && <span className="product-badge">New</span>}
                                            <img
                                                src={rp.images?.[0]}
                                                alt={rp.name}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="product-info">
                                            <h3 className="product-name">{rp.name}</h3>
                                            <div className="product-price">
                                                <span className="current-price">
                                                    {formatPrice(rp.discountPrice || rp.price)}
                                                </span>
                                                {rp.discountPrice && (
                                                    <span className="original-price">
                                                        {formatPrice(rp.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
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

export default ProductDetails;
