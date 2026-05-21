import { NavLink, Link } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen }) => {
    return (
        <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <Link to="/" className="sidebar-logo">
                    SARA <span>Admin</span>
                </Link>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink 
                            to="/admin/dashboard" 
                            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="9"></rect>
                                <rect x="14" y="3" width="7" height="5"></rect>
                                <rect x="14" y="12" width="7" height="9"></rect>
                                <rect x="3" y="16" width="7" height="5"></rect>
                            </svg>
                            Product Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/admin/analytics" 
                            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 3v18h18"></path>
                                <path d="m19 9-5 5-4-4-3 3"></path>
                            </svg>
                            Analytics Dashboard
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/admin/homepage" 
                            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                            Home Page Manager
                        </NavLink>
                    </li>
                    <li>
                        <NavLink 
                            to="/admin/orders" 
                            className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                                <path d="M3 6h18"></path>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            Manage Orders
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <Link to="/" className="back-to-site">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Back to Website
                </Link>
            </div>
        </aside>
    );
};

export default AdminSidebar;
