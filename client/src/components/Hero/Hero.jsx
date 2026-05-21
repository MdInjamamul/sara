import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    // Slide data with titles, descriptions, and product images
    const [slides, setSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch config on mount
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/hero-config');
                const data = await res.json();
                if (data && data.slides && data.slides.length > 0) {
                    const validSlides = data.slides.filter(s => s.products && s.products.length === 3);
                    setSlides(validSlides);
                } else {
                    setSlides([]); // Handle empty state
                }
            } catch (err) {
                console.error("Failed to load hero config:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const goToSlide = useCallback((index) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentSlide(index);
        setTimeout(() => setIsAnimating(false), 600);
    }, [isAnimating]);

    const nextSlide = useCallback(() => {
        goToSlide((currentSlide + 1) % slides.length);
    }, [currentSlide, slides.length, goToSlide]);

    const prevSlide = useCallback(() => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    }, [currentSlide, slides.length, goToSlide]);

    // Auto-slide every 5 seconds
    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [nextSlide, slides.length]);

    if (isLoading) {
        return <div className="hero-slider-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
    }

    if (slides.length === 0) {
        return null;
    }

    const currentSlideData = slides[currentSlide];

    return (
        <section className="hero-slider-section">
            <div className="hero-slider-container">
                {/* Left Arrow */}
                <button
                    className="hero-nav-arrow hero-nav-prev"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>

                {/* Slide Content */}
                <div className="hero-slide-content">
                    {/* Left Side - Text */}
                    <div className="hero-slide-text">
                        <h1
                            className="hero-slide-title"
                            style={{ color: currentSlideData.accentColor }}
                            key={`title-${currentSlide}`}
                        >
                            {currentSlideData.title}
                        </h1>
                        <Link
                            to={`/products?category=${currentSlideData.slug}`}
                            className="hero-see-more-btn"
                            style={{ backgroundColor: currentSlideData.accentColor }}
                        >
                            See More
                        </Link>
                    </div>

                    {/* Right Side - Products */}
                    <div className="hero-products-display" key={`products-${currentSlide}`}>
                        {currentSlideData.products.map((slot, index) => {
                            if (!slot || !slot.product) return null;
                            const product = slot.product;
                            return (
                                <div
                                    className={`hero-product-item hero-product-item-${index + 1}`}
                                    key={`${currentSlide}-${index}`}
                                >
                                    <div className="hero-product-label">{currentSlideData.subtitle}</div>
                                    <img
                                        src={product.images?.[0] || '/assets/images/placeholder.png'}
                                        alt={product.name}
                                        className="hero-product-image"
                                    />
                                    <div className="hero-product-name">{product.name}</div>
                                    <div className="hero-product-tag">{slot.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Arrow */}
                <button
                    className="hero-nav-arrow hero-nav-next"
                    onClick={nextSlide}
                    aria-label="Next slide"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Dot Indicators */}
            <div className="hero-slide-dots">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero-slide-dot ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => goToSlide(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
