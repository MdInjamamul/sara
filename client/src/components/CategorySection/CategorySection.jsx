import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './CategorySection.css';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const categories = [
    {
        name: 'Medicinal Herbs',
        slug: 'medicinal-herbs',
        count: 8,
        image: '/assets/images/categories/yarsagumba_yarsha.png',
        description: 'Premium quality medicinal herbs sourced from the Himalayas'
    },
    {
        name: 'Natural Essential Oils',
        slug: 'essential-oils',
        count: 8,
        image: '/assets/images/categories/rose_oil.png',
        description: 'Pure and organic essential oils extracted from nature\'s finest botanicals'
    },
    {
        name: 'Natural Herbal Oils',
        slug: 'herbal-oils',
        count: 8,
        image: '/assets/images/categories/black_seed_oil.png',
        description: 'Cold-pressed herbal oils for skin, hair, and overall wellness'
    },
    {
        name: 'Organic Super Foods',
        slug: 'superfoods',
        count: 8,
        image: '/assets/images/categories/chia_seeds.png',
        description: 'Nutrient-rich superfoods to boost your daily health and energy'
    },
    {
        name: 'Natural Cosmetics',
        slug: 'cosmetics',
        count: 8,
        image: '/assets/images/categories/basil_soap.png',
        description: 'Chemical-free natural cosmetics for healthy skin and hair care'
    },
    {
        name: 'Organic Spices',
        slug: 'spices',
        count: 8,
        image: '/assets/images/categories/cinnamon_spices.png',
        description: 'Authentic organic spices to add flavor and health benefits'
    },
    {
        name: 'Spiritual Items',
        slug: 'spiritual-items',
        count: 8,
        image: '/assets/images/categories/candles.png',
        description: 'Sacred items for meditation, prayer, and spiritual practices'
    },
    {
        name: 'Sara Nursery',
        slug: 'nursery',
        count: 8,
        image: '/assets/images/categories/aloe_vera_plant.png',
        description: 'Healthy plants for your home garden with medicinal benefits'
    }
];

const CategorySection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef(null);
    const containerRef = useRef(null);
    const headerRef = useRef(null);
    const listRef = useRef(null);
    const previewRef = useRef(null);
    const previewImgRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        const list = listRef.current;
        const preview = previewRef.current;

        // Create a GSAP context for cleanup
        const ctx = gsap.context(() => {
            // Pin the container (header + content together)
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    start: 'top 80px', // Pin when container reaches 80px from top (below navbar)
                    end: '+=2500',
                    pin: true,
                    pinSpacing: true,
                    scrub: 0.5,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const progress = self.progress;
                        const newIndex = Math.min(
                            Math.floor(progress * categories.length),
                            categories.length - 1
                        );
                        setActiveIndex(newIndex);
                    }
                }
            });

            // Set initial states - hide both list container and preview
            gsap.set(list, { opacity: 0, x: -60 });
            gsap.set(list.querySelectorAll('.category-item'), { opacity: 0, x: -40 });
            gsap.set(preview, { opacity: 0, scale: 0.95, x: 60 });

            // Animate both containers in together
            tl.to([list, preview], {
                opacity: 1,
                scale: 1,
                x: 0,
                duration: 0.04,
                ease: 'power2.out'
            });

            // Sequential category reveals
            const categoryItems = list.querySelectorAll('.category-item');
            const durationPerCategory = 0.96 / categories.length;

            categoryItems.forEach((item, index) => {
                // Fade in this category item
                tl.to(item, {
                    opacity: 1,
                    x: 0,
                    duration: durationPerCategory * 0.3,
                    ease: 'power2.out'
                });

                // Add highlight effect
                tl.to(item, {
                    backgroundColor: 'var(--color-cream)',
                    boxShadow: 'var(--shadow-sm)',
                    duration: durationPerCategory * 0.4
                });

                // Hold for a moment
                tl.to({}, { duration: durationPerCategory * 0.2 });

                // Remove highlight (except for last item)
                if (index < categories.length - 1) {
                    tl.to(item, {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        duration: durationPerCategory * 0.1
                    });
                }
            });

        }, container);

        // Cleanup
        return () => ctx.revert();
    }, []);

    // Update preview image when activeIndex changes
    useEffect(() => {
        if (previewImgRef.current && overlayRef.current) {
            gsap.to(previewImgRef.current, {
                opacity: 0,
                duration: 0.15,
                onComplete: () => {
                    previewImgRef.current.src = categories[activeIndex].image;
                    gsap.to(previewImgRef.current, { opacity: 1, duration: 0.15 });
                }
            });

            gsap.to(overlayRef.current, {
                opacity: 0,
                y: 10,
                duration: 0.1,
                onComplete: () => {
                    gsap.to(overlayRef.current, { opacity: 1, y: 0, duration: 0.15 });
                }
            });
        }
    }, [activeIndex]);

    return (
        <section className="category-section" ref={sectionRef}>
            {/* This container gets pinned - includes header and content */}
            <div className="category-container" ref={containerRef}>
                <div className="section-header" ref={headerRef}>
                    <h2>Our Categories</h2>
                    <p>Explore our wide range of natural and organic products</p>
                </div>

                <div className="category-section-inner">
                    <div className="category-list" ref={listRef}>
                        {categories.map((category, index) => (
                            <button
                                key={category.slug}
                                className={`category-item ${activeIndex === index ? 'active' : ''}`}
                            >
                                <span>{category.name}</span>
                                <span className="category-item-count">{category.count} Products</span>
                            </button>
                        ))}
                    </div>

                    <div className="category-preview" ref={previewRef}>
                        <img
                            ref={previewImgRef}
                            src={categories[activeIndex].image}
                            alt={categories[activeIndex].name}
                        />
                        <div className="category-preview-overlay" ref={overlayRef}>
                            <h3>{categories[activeIndex].name}</h3>
                            <p>{categories[activeIndex].description}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
