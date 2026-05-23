import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotification } from '../../context/NotificationContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import './Navbar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_URL.replace('/api', '')}${path}`;
};

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { cartCount, toggleCart } = useCart();
    const { wishlistCount, toggleWishlistSidebar } = useWishlist();
    const { unreadCount } = useNotification();
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const profileRef = useRef(null);
    const searchRef = useRef(null);
    const notificationRef = useRef(null);
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Close profile dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchOpen(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close dropdowns on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
        setIsSearchOpen(false);
        setIsNotificationOpen(false);
    }, [location.pathname]);

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

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
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
                    {!user && (
                        <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Login / Signup</Link></li>
                    )}
                </ul>

                <div className="navbar-actions">
                    <div className={`navbar-search ${isSearchOpen ? 'open' : ''}`} ref={searchRef}>
                        <div className="navbar-icon" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <path d="m21 21-4.3-4.3"></path>
                            </svg>
                        </div>
                        {isSearchOpen && (
                            <form className="search-form" onSubmit={handleSearchSubmit}>
                                <input 
                                    type="text" 
                                    placeholder="Search products..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    autoFocus
                                />
                                <button type="submit" className="search-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m5 12 7-7 7 7"></path>
                                        <path d="M12 19V5"></path>
                                    </svg>
                                </button>
                            </form>
                        )}
                    </div>
                    
                    <div className="navbar-icon" onClick={toggleWishlistSidebar} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        {wishlistCount > 0 && <span className="cart-count">{wishlistCount}</span>}
                    </div>

                    <div className="navbar-icon" onClick={toggleCart} style={{ cursor: 'pointer' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                            <path d="M3 6h18"></path>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </div>

                    {user && (
                        <>
                            <div className="navbar-icon notification-icon" ref={notificationRef} onClick={() => setIsNotificationOpen(!isNotificationOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                                </svg>
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                <NotificationDropdown isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                            </div>

                            <div className="navbar-profile" ref={profileRef} onClick={() => setIsProfileOpen(!isProfileOpen)}>
                                <div className="profile-avatar">
                                    {user.photo ? (
                                        <img src={getImageUrl(user.photo)} alt="Profile" />
                                    ) : (
                                        <div className="avatar-placeholder">{user.name.charAt(0).toUpperCase()}</div>
                                    )}
                                </div>
                                
                                {isProfileOpen && (
                                    <div className="profile-dropdown">
                                        <div className="profile-dropdown-header">
                                            <div className="profile-dropdown-avatar">
                                                {user.photo ? (
                                                    <img src={user.photo} alt="Profile" />
                                                ) : (
                                                    <div className="avatar-placeholder large">{user.name.charAt(0).toUpperCase()}</div>
                                                )}
                                            </div>
                                            <div className="profile-dropdown-info">
                                                <h4 className="full-name">{user.name}</h4>
                                                <span className="short-name">@{user.name.split(' ')[0].toLowerCase()}</span>
                                                <span className="email">{user.email}</span>
                                                {user.phone && <span className="phone">{user.phone}</span>}
                                            </div>
                                        </div>
                                        <div className="profile-dropdown-menu">
                                            <Link to="/profile" className="dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                                My Profile
                                            </Link>
                                            <Link to="/my-orders" className="dropdown-item">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                                                My Orders
                                            </Link>
                                            {user.location && (
                                                <div className="dropdown-item static">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                    {user.location}
                                                </div>
                                            )}
                                            {user.role === 'admin' && (
                                                <Link to="/admin/dashboard" className="dropdown-item">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><line x1="3" x2="21" y1="9" y2="9"></line><line x1="9" x2="9" y1="21" y2="9"></line></svg>
                                                    Dashboard
                                                </Link>
                                            )}
                                            <div className="dropdown-divider"></div>
                                            <button onClick={logout} className="dropdown-item text-danger">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

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
