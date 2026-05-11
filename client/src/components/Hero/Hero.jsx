import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './Hero.css';

const Hero = () => {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [loading, setLoading] = useState(true);
    const slideRef = useRef(null);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const res = await fetch('/api/homepage');
                const data = await res.json();
                if (data.heroSlides && data.heroSlides.length > 0) {
                    setSlides(data.heroSlides);
                }
            } catch (error) {
                console.error("Failed to load hero slides:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSlides();
    }, []);

    useEffect(() => {
        if (!loading && slides.length > 0 && slideRef.current) {
            const tl = gsap.timeline();
            tl.fromTo(slideRef.current.querySelectorAll('.hero-subtitle, .hero-title, .hero-description, .hero-cta'),
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
            );

            tl.fromTo(slideRef.current.querySelectorAll('.hero-product-card'),
                { y: 50, opacity: 0, scale: 0.9 },
                { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.2)' },
                "-=0.6"
            );
        }
    }, [currentSlide, loading, slides.length]);

    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    if (loading) {
        return <div className="hero loading"><div className="spinner" style={{ margin: 'auto', borderTopColor: '#4ade80', width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', animation: 'spin 1s linear infinite' }}></div></div>;
    }

    if (slides.length === 0) {
        return null; // Don't render hero if no slides are active
    }

    const slide = slides[currentSlide];

    return (
        <section className="hero">
            <div
                className="hero-background"
                style={{
                    background: `linear-gradient(135deg, ${slide.accentColor}15 0%, ${slide.accentColor}05 100%)`
                }}
            />

            <div className="hero-container" ref={slideRef}>
                <div className="hero-content">
                    <span 
                        className="hero-subtitle"
                        style={{ color: slide.accentColor }}
                    >
                        {slide.subtitle}
                    </span>
                    <h1 className="hero-title">{slide.title}</h1>
                    <p className="hero-description">{slide.description}</p>
                    
                    <Link
                        to={`/products?category=${slide.categorySlug}`}
                        className="hero-cta"
                        style={{
                            backgroundColor: slide.accentColor,
                            boxShadow: `0 8px 24px ${slide.accentColor}40`
                        }}
                    >
                        Shop Collection
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>

                <div className="hero-visuals">
                    <div className="hero-products-grid">
                        {slide.products.map((product, index) => (
                            <Link 
                                to={`/products/${product.slug}`} 
                                key={product._id || index}
                                className={`hero-product-card card-${index + 1}`}
                            >
                                <div className="hpc-image">
                                    <img src={product.images?.[0] || '/placeholder.png'} alt={product.name} />
                                    {product.discountPrice && (
                                        <div className="hpc-discount-badge" style={{ backgroundColor: slide.accentColor, position: 'absolute', top: '10px', right: '10px', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            Save {Math.round((1 - product.discountPrice / product.price) * 100)}%
                                        </div>
                                    )}
                                </div>
                                <div className="hpc-info">
                                    <h3>{product.name}</h3>
                                    <div className="hpc-price">
                                        {product.discountPrice ? (
                                            <>
                                                <span className="current" style={{ color: slide.accentColor, fontWeight: 'bold', marginRight: '8px' }}>
                                                    Rs. {product.discountPrice.toLocaleString()}
                                                </span>
                                                <span className="original" style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>
                                                    Rs. {product.price.toLocaleString()}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="current" style={{ color: slide.accentColor, fontWeight: 'bold' }}>
                                                Rs. {product.price.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {slides.length > 1 && (
                <div className="hero-controls">
                    <div className="hero-dots">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`hero-dot ${currentSlide === index ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                                aria-label={`Go to slide ${index + 1}`}
                                style={currentSlide === index ? { backgroundColor: slide.accentColor } : {}}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default Hero;
