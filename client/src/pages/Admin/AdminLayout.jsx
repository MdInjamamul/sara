import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import './AdminLayout.css';

const navItems = [
    {
        label: 'Dashboard',
        path: '/admin',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        label: 'Products',
        path: '/admin/products',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
        ),
    },
    {
        label: 'Homepage',
        path: '/admin/homepage',
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Get current page title from nav items
    const currentPage = navItems.find(item => {
        if (item.path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(item.path);
    });
    const pageTitle = currentPage?.label || 'Admin';

    return (
        <div className="admin-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <div className="admin-brand">
                        <span className="admin-brand-icon">✦</span>
                        <div>
                            <h2>SARA</h2>
                            <span>Admin Panel</span>
                        </div>
                    </div>
                    <button
                        className="admin-sidebar-close"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <nav className="admin-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) =>
                                `admin-nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span className="admin-nav-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/" className="admin-nav-item admin-back-link">
                        <span className="admin-nav-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </span>
                        <span className="admin-nav-label">Back to Store</span>
                    </NavLink>
                </div>
            </aside>

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <button
                        className="admin-menu-btn"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open menu"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </button>

                    <div className="admin-topbar-title">
                        <h1>{pageTitle}</h1>
                    </div>

                    <div className="admin-topbar-actions">
                        <span className="admin-status-badge">
                            <span className="status-dot" />
                            Live
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
