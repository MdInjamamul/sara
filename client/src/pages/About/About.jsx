import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-overlay">
          <div className="about-hero-content">
            <h1 className="about-hero-title">About SARA Herbal Company</h1>
            <p className="about-hero-subtitle">
              Bringing Nepal's finest herbal treasures to the world since 2015
            </p>
            <nav className="about-breadcrumb">
              <Link to="/">Home</Link>
              <span className="about-breadcrumb-sep">/</span>
              <span>About Us</span>
            </nav>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="about-story">
        <div className="about-story-inner">
          <div className="about-story-text">
            <h2 className="about-section-heading">Our Story</h2>
            <div className="about-section-divider"></div>
            <p>
              Founded in the heart of Kathmandu, SARA Herbal Company began with a
              simple yet powerful vision — to share Nepal's rich tradition of herbal
              wellness with the world. For over a decade, we have been sourcing the
              finest herbs, spices, and natural products from the pristine Himalayan
              regions of Nepal.
            </p>
            <p>
              What started as a small family endeavor has grown into a trusted name
              in organic and sustainable herbal products. Our founder, driven by a
              deep respect for traditional Nepali medicine, established SARA to
              bridge the gap between ancient wisdom and modern wellness needs.
            </p>
          </div>
          <div className="about-story-visual">
            <div className="about-story-deco">
              <div className="about-story-deco-leaf">
                <svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M60 10C30 40 10 80 10 120C10 140 30 155 60 155C90 155 110 140 110 120C110 80 90 40 60 10Z"
                    fill="var(--color-primary)"
                    opacity="0.12"
                  />
                  <path
                    d="M60 10C30 40 10 80 10 120C10 140 30 155 60 155C90 155 110 140 110 120C110 80 90 40 60 10Z"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                  <line x1="60" y1="30" x2="60" y2="145" stroke="var(--color-primary)" strokeWidth="1.5" opacity="0.25" />
                  <path d="M60 60C45 70 35 85 30 100" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" fill="none" />
                  <path d="M60 60C75 70 85 85 90 100" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" fill="none" />
                  <path d="M60 90C50 95 42 105 38 115" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" fill="none" />
                  <path d="M60 90C70 95 78 105 82 115" stroke="var(--color-primary)" strokeWidth="1" opacity="0.2" fill="none" />
                </svg>
              </div>
              <span className="about-story-deco-year">Est. 2015</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mission">
        <div className="about-mission-inner">
          <div className="about-mission-card">
            <div className="about-mission-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="20" stroke="var(--color-primary)" strokeWidth="2.5" fill="none" />
                <circle cx="24" cy="24" r="14" stroke="var(--color-primary)" strokeWidth="2" fill="none" opacity="0.6" />
                <circle cx="24" cy="24" r="8" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" opacity="0.4" />
                <circle cx="24" cy="24" r="3" fill="var(--color-accent)" />
              </svg>
            </div>
            <h3 className="about-mission-title">Our Mission</h3>
            <p className="about-mission-text">
              To promote holistic wellness by providing pure, organic, and
              sustainably sourced herbal products that honor Nepal's ancient
              traditions while meeting modern quality standards.
            </p>
          </div>
          <div className="about-mission-card">
            <div className="about-mission-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M24 14C17 14 11 18.5 8 24C11 29.5 17 34 24 34C31 34 37 29.5 40 24C37 18.5 31 14 24 14Z"
                  stroke="var(--color-primary)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <circle cx="24" cy="24" r="6" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
                <circle cx="24" cy="24" r="2.5" fill="var(--color-accent)" />
              </svg>
            </div>
            <h3 className="about-mission-title">Our Vision</h3>
            <p className="about-mission-text">
              To become a globally recognized leader in herbal wellness,
              empowering communities through sustainable agriculture and fair
              trade practices across Nepal and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="about-values">
        <div className="about-values-inner">
          <h2 className="about-section-heading about-section-heading--center">Our Values</h2>
          <div className="about-section-divider about-section-divider--center"></div>
          <div className="about-values-grid">
            <div className="about-value-card">
              <span className="about-value-emoji">🌿</span>
              <h4 className="about-value-title">Purity</h4>
              <p className="about-value-desc">
                Every product is 100% natural, free from synthetic additives,
                preservatives, and chemicals.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-emoji">🌍</span>
              <h4 className="about-value-title">Sustainability</h4>
              <p className="about-value-desc">
                We practice eco-friendly farming, ethical sourcing, and
                minimal-waste packaging to protect our planet.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-emoji">💚</span>
              <h4 className="about-value-title">Wellness</h4>
              <p className="about-value-desc">
                We believe in the healing power of nature and strive to enhance
                well-being through our carefully curated products.
              </p>
            </div>
            <div className="about-value-card">
              <span className="about-value-emoji">✅</span>
              <h4 className="about-value-title">Quality</h4>
              <p className="about-value-desc">
                Rigorous testing and quality control ensure every product meets
                the highest international standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-stats">
        <div className="about-stats-inner">
          <div className="about-stat-item">
            <span className="about-stat-number">10+</span>
            <span className="about-stat-label">Years of Experience</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">200+</span>
            <span className="about-stat-label">Products</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">50,000+</span>
            <span className="about-stat-label">Happy Customers</span>
          </div>
          <div className="about-stat-item">
            <span className="about-stat-number">25+</span>
            <span className="about-stat-label">Countries Served</span>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="about-why">
        <div className="about-why-inner">
          <h2 className="about-section-heading about-section-heading--center">Why Choose Us</h2>
          <div className="about-section-divider about-section-divider--center"></div>
          <div className="about-why-grid">
            <div className="about-why-card">
              <div className="about-why-icon">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M22 4L22 14"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M22 14C16 18 12 26 14 34C16 38 20 40 22 40C24 40 28 38 30 34C32 26 28 18 22 14Z"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    fill="var(--color-primary)"
                    opacity="0.1"
                  />
                  <path
                    d="M22 14C16 18 12 26 14 34C16 38 20 40 22 40C24 40 28 38 30 34C32 26 28 18 22 14Z"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path d="M15 8L22 14L29 8" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="about-why-title">Himalayan Sourced</h4>
              <p className="about-why-desc">
                Our products are sourced directly from the pristine Himalayan
                regions of Nepal, ensuring unmatched purity and potency.
              </p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="10" y="16" width="24" height="20" rx="3" stroke="var(--color-primary)" strokeWidth="2" fill="none" />
                  <path d="M16 16V12C16 8.7 18.7 6 22 6C25.3 6 28 8.7 28 12V16" stroke="var(--color-primary)" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <circle cx="22" cy="22" r="4" stroke="var(--color-primary)" strokeWidth="1.5" fill="var(--color-primary)" opacity="0.15" />
                  <circle cx="22" cy="22" r="4" stroke="var(--color-primary)" strokeWidth="1.5" fill="none" />
                  <line x1="22" y1="24" x2="22" y2="30" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="22" cy="22" r="1.5" fill="var(--color-accent)" />
                </svg>
              </div>
              <h4 className="about-why-title">Lab Tested</h4>
              <p className="about-why-desc">
                Every batch undergoes rigorous laboratory testing to guarantee
                safety, efficacy, and compliance with international standards.
              </p>
            </div>
            <div className="about-why-card">
              <div className="about-why-icon">
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 34C12 34 16 28 22 28C28 28 32 34 32 34"
                    stroke="var(--color-primary)"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="20" r="5" stroke="var(--color-primary)" strokeWidth="2" fill="var(--color-primary)" opacity="0.1" />
                  <circle cx="30" cy="20" r="5" stroke="var(--color-primary)" strokeWidth="2" fill="var(--color-primary)" opacity="0.1" />
                  <circle cx="22" cy="14" r="6" stroke="var(--color-primary)" strokeWidth="2" fill="var(--color-primary)" opacity="0.1" />
                  <path d="M18 38L22 42L26 38" stroke="var(--color-accent)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h4 className="about-why-title">Fair Trade</h4>
              <p className="about-why-desc">
                We work directly with local farmers and communities, ensuring
                fair compensation and sustainable livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-cta-inner">
          <h2 className="about-cta-title">Ready to Experience Natural Wellness?</h2>
          <p className="about-cta-subtitle">
            Explore our collection of premium herbal products
          </p>
          <div className="about-cta-buttons">
            <Link to="/products" className="about-cta-btn about-cta-btn--primary">
              Explore Products
            </Link>
            <Link to="/contact" className="about-cta-btn about-cta-btn--outline">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
