import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import Toast from '../../components/Toast/Toast';
import { Link } from 'react-router-dom';
import './Contact.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Contact = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const handleChange = (e) => {
    if (e.target.name === 'phone') {
      const val = e.target.value.replace(/[^0-9]/g, '');
      if (val.length <= 10) {
        setForm({ ...form, [e.target.name]: val });
      }
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.subject.trim() || !form.message.trim()) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        setToast({ message: data.message || 'Message sent successfully! We\'ll get back to you soon.', type: 'success' });
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setToast({ message: data.message || 'Failed to send message. Please try again.', type: 'error' });
      }
    } catch {
      setToast({ message: 'Something went wrong. Please try again later.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Hero Banner */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="contact-hero-content">
          <h1 className="contact-hero-title">Get in Touch</h1>
          <p className="contact-hero-subtitle">We'd love to hear from you. Reach out to us for any inquiries.</p>
          <nav className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-sep">/</span>
            <span>Contact</span>
          </nav>
        </div>
      </section>

      {/* Main Content */}
      <main className="contact-main">
        <div className="contact-grid">

          {/* Left Side — Contact Info Card */}
          <div className="contact-info-card">
            <h2 className="info-card-title">Contact Information</h2>
            <p className="info-card-subtitle">SARA WORLDWIDE BUSINESS</p>

            <div className="info-items">
              {/* Address */}
              <div className="info-item">
                <span className="info-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <div className="info-item-text">
                  <span className="info-label">Address</span>
                  <span className="info-value">Kalanki-14, Kathmandu, Nepal</span>
                </div>
              </div>

              {/* Phone */}
              <div className="info-item">
                <span className="info-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <div className="info-item-text">
                  <span className="info-label">Phone</span>
                  <span className="info-value">+977 1 5225181</span>
                </div>
              </div>

              {/* Mobile */}
              <div className="info-item">
                <span className="info-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                </span>
                <div className="info-item-text">
                  <span className="info-label">Mobile</span>
                  <span className="info-value">+977 9851105234, 9808500141</span>
                </div>
              </div>

              {/* Email */}
              <div className="info-item">
                <span className="info-item-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <div className="info-item-text">
                  <span className="info-label">Email</span>
                  <a href="mailto:info@saraworldwide.com.np" className="info-value info-link">info@saraworldwide.com.np</a>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="office-hours">
              <div className="office-hours-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <h3>Office Hours</h3>
              </div>
              <div className="hours-list">
                <div className="hours-row">
                  <span className="hours-day">Sunday – Friday</span>
                  <span className="hours-time">9:00 AM – 6:00 PM</span>
                </div>
                <div className="hours-row">
                  <span className="hours-day">Saturday</span>
                  <span className="hours-time closed">Closed</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Twitter">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Side — Contact Form */}
          <div className="contact-form-card">
            <h2 className="form-card-title">Send us a Message</h2>
            <p className="form-card-subtitle">Fill out the form below and we'll get back to you as soon as possible.</p>

            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address <span className="required">*</span></label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number <span className="required">*</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                    maxLength="10"
                    pattern="^[0-9]{10}$"
                    title="Please enter exactly 10 digits"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject <span className="required">*</span></label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="btn-spinner" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
