import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Check if current path matches the link
    const isActive = (path) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="navbar">
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    SARA
                </Link>

                <ul className={`navbar-menu ${isMenuOpen ? 'open' : ''}`}>
                    <li><Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link></li>
                    <li><Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link></li>
                    <li><Link to="/products" className={isActive('/products') ? 'active' : ''}>Products</Link></li>
                    <li><Link to="/blog" className={isActive('/blog') ? 'active' : ''}>Blog</Link></li>
                    <li><Link to="/contact" className={isActive('/contact') ? 'active' : ''}>Contact</Link></li>
                    <li><Link to="/admin/dashboard" className={isActive('/admin/dashboard') ? 'active' : ''}>Dashboard</Link></li>
                </ul>

                <div className="navbar-actions">
                    <div className="navbar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                    </div>
                    <div className="navbar-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <path d="M3 6h18"></path>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        <span className="cart-count">0</span>
                    </div>

                    <div className="navbar-toggle" onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
