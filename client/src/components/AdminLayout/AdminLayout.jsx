import { useState } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="admin-layout">
            <AdminSidebar isOpen={isSidebarOpen} />
            
            <div className="admin-content-wrapper">
                {/* Mobile Header for Sidebar Toggle */}
                <div className="admin-mobile-header">
                    <div className="admin-mobile-logo">
                        SARA <span>Admin</span>
                    </div>
                    <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Overlay for mobile when sidebar is open */}
                {isSidebarOpen && (
                    <div className="admin-sidebar-overlay" onClick={toggleSidebar}></div>
                )}

                <main className="admin-main-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
