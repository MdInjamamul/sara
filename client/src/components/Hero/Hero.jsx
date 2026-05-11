import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero = () => {
    // Slide data with titles, descriptions, and product images
    const slides = [
        {
            title: 'Medicinal Herbs',
            subtitle: 'NATURAL HEALING',
            slug: 'medicinal-herbs',
            description: 'Ancient Himalayan herbs for natural wellness and vitality',
            products: [
                { image: '/assets/images/banners/medicinal_herbs/ashwagandha.png', name: 'Ashwagandha', label: 'Natural Herbal' },
                { image: '/assets/images/banners/medicinal_herbs/ginseng.png', name: 'Ginseng', label: 'Natural Herbal' },
                { image: '/assets/images/banners/medicinal_herbs/yarsagumba.png', name: 'Yarsagumba', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Natural Cosmetics',
            subtitle: 'PURE BEAUTY',
            slug: 'cosmetics',
            description: 'Organic skincare crafted with nature\'s finest ingredients',
            products: [
                { image: '/assets/images/banners/natural_cosmetics/basil_soap.png', name: 'Basil Soap', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_cosmetics/henna_powder.png', name: 'Henna Powder', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_cosmetics/orange_peel_powder.png', name: 'Orange Peel Powder', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Essential Oils',
            subtitle: 'PURE AROMATHERAPY',
            slug: 'essential-oils',
            description: 'Premium botanical extracts for wellness and relaxation',
            products: [
                { image: '/assets/images/banners/natural_essential_oil/eucalyptus_oil.png', name: 'Eucalyptus Oil', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_essential_oil/jasmine_oil.png', name: 'Jasmine Oil', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_essential_oil/lavender_oil.png', name: 'Lavender Oil', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Herbal Oils',
            subtitle: 'THERAPEUTIC WELLNESS',
            slug: 'herbal-oils',
            description: 'Cold-pressed natural oils for health and vitality',
            products: [
                { image: '/assets/images/banners/natural_herbal_oil/black_seed_oil.png', name: 'Black Seed Oil', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_herbal_oil/hemp_seed_oil.png', name: 'Hemp Seed Oil', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_herbal_oil/flax_seed_oil.png', name: 'Flax Seed Oil', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Organic Spices',
            subtitle: 'PURE & NATURAL',
            slug: 'spices',
            description: 'Authentic spices sourced from organic farms',
            products: [
                { image: '/assets/images/banners/natural_organic_spices/cinnamon.png', name: 'Cinnamon', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_organic_spices/cumin_seeds.png', name: 'Cumin Seeds', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_organic_spices/turmeric_powder.png', name: 'Turmeric Powder', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Superfoods',
            subtitle: 'NUTRIENT RICH',
            slug: 'superfoods',
            description: 'Power-packed organic superfoods for optimal health',
            products: [
                { image: '/assets/images/banners/natural_organic_superfoods/flax_seeds.png', name: 'Flax Seeds', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_organic_superfoods/moringa_powder.png', name: 'Moringa Powder', label: 'Natural Herbal' },
                { image: '/assets/images/banners/natural_organic_superfoods/quinoa_seeds.png', name: 'Quinoa Seeds', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Sara Nursery',
            subtitle: 'GREEN LIVING',
            slug: 'nursery',
            description: 'Healthy plants for your home and garden',
            products: [
                { image: '/assets/images/banners/sara_nursery/aloe_vera_plant.png', name: 'Aloe Vera Plant', label: 'Natural Herbal' },
                { image: '/assets/images/banners/sara_nursery/peace_lily_plant.png', name: 'Peace Lily Plant', label: 'Natural Herbal' },
                { image: '/assets/images/banners/sara_nursery/tulsi_plant.png', name: 'Tulsi Plant', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        },
        {
            title: 'Spiritual',
            subtitle: 'SACRED ESSENTIALS',
            slug: 'spiritual-items',
            description: 'Traditional spiritual items for meditation and prayer',
            products: [
                { image: '/assets/images/banners/spritual/insence_sticks.png', name: 'Incense Sticks', label: 'Natural Herbal' },
                { image: '/assets/images/banners/spritual/prayer_beads.png', name: 'Prayer Beads', label: 'Natural Herbal' },
                { image: '/assets/images/banners/spritual/singing_bowl.png', name: 'Singing Bowl', label: 'SARA PREMIUM' }
            ],
            accentColor: '#8B4513'
        }
    ];

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
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(interval);
    }, [nextSlide]);

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
                        {currentSlideData.products.map((product, index) => (
                            <div
                                className={`hero-product-item hero-product-item-${index + 1}`}
                                key={`${currentSlide}-${index}`}
                            >
                                <div className="hero-product-label">{currentSlideData.subtitle}</div>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="hero-product-image"
                                />
                                <div className="hero-product-name">{product.name}</div>
                                <div className="hero-product-tag">{product.label}</div>
                            </div>
                        ))}
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
