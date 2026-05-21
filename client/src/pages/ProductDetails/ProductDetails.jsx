import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import ProductCard from '../../components/ProductCard/ProductCard';
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
    const currentPrice = product ? (product.discountPrice || product.price) : 0;
    const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

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
                                    {!product.inStock && <span className="badge-tag out-of-stock">Out of Stock</span>}
                                    {product.inStock && product.isOffer && (
                                        <span className="badge-tag offer">{product.offerLabel || 'Special Offer'}</span>
                                    )}
                                    {product.inStock && product.isBestseller && <span className="badge-tag bestseller">Bestseller</span>}
                                    {product.inStock && product.isNew && <span className="badge-tag new">New</span>}
                                    {product.inStock && hasDiscount && <span className="badge-tag sale">-{discountPercent}%</span>}
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

                            {/* Short Description */}
                            <p className="pdp-short-desc" itemProp="description">
                                {product.shortDescription}
                            </p>

                            {/* Price Block */}
                            <div className="pdp-price-block" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                                <meta itemProp="priceCurrency" content="NPR" />
                                <meta itemProp="price" content={currentPrice} />
                                <span className="pdp-current-price">{formatPrice(currentPrice)}</span>
                                {hasDiscount && (
                                    <>
                                        <span className="pdp-original-price">{formatPrice(product.price)}</span>
                                        <span className="pdp-discount-percent">-{discountPercent}% OFF</span>
                                    </>
                                )}
                                <link
                                    itemProp="availability"
                                    href={
                                        product.inStock !== false
                                            ? 'https://schema.org/InStock'
                                            : 'https://schema.org/OutOfStock'
                                    }
                                />
                            </div>

                            {/* Stock Status */}
                            <div className={`pdp-stock ${product.inStock !== false ? 'in-stock' : 'out-of-stock'}`}>
                                <span className="stock-dot"></span>
                                <span>{product.inStock !== false ? 'In Stock' : 'Out of Stock'}</span>
                            </div>

                            <hr className="pdp-divider" />

                            {/* Quantity & Add to Cart */}
                            <div className="pdp-actions">
                                <div className="pdp-quantity" aria-label="Product quantity">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span aria-live="polite">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="pdp-add-to-cart"
                                    id="add-to-cart-btn"
                                    aria-label={`Add ${product.name} to cart`}
                                    disabled={product.inStock === false}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                                        <path d="M3 6h18"></path>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    Add to Cart
                                </button>

                                <button className="pdp-wishlist-btn" aria-label="Add to wishlist">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                    </svg>
                                </button>
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
                        </div>
                    </section>

                    {/* Related Products Section */}
                    {relatedProducts.length > 0 && (
                        <section className="pdp-related-section" aria-label="Related products">
                            <div className="pdp-related-header">
                                <h2>You May Also Like</h2>
                                <p>Explore more products from {categoryName}</p>
                            </div>
                            <div className="pdp-related-grid">
                                {relatedProducts.map((rp) => (
                                    <div key={rp._id || rp.slug} className="related-product-wrapper">
                                        <ProductCard product={rp} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductDetails;
