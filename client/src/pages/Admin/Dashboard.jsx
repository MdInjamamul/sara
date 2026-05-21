import { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch('/api/admin/stats');
                if (!response.ok) throw new Error('Failed to fetch dashboard stats');
                const data = await response.json();
                setStats(data);
            } catch (error) {
                toast.error(error.message);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [toast]);

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-blue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Total Products</h3>
                        <p className="stat-value">{stats?.totalProducts || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-purple">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Categories</h3>
                        <p className="stat-value">{stats?.totalCategories || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-green">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Featured</h3>
                        <p className="stat-value">{stats?.featuredProducts || 0}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon stat-red">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>Out of Stock</h3>
                        <p className="stat-value">{stats?.outOfStock || 0}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Products by Category</h2>
                    </div>
                    <div className="category-stats-list">
                        {stats?.categoryStats?.map(cat => (
                            <div key={cat.slug} className="category-stat-item">
                                <span className="category-name">{cat.name}</span>
                                <span className="category-count">{cat.productCount} products</span>
                                <div className="category-progress-bg">
                                    <div 
                                        className="category-progress-bar" 
                                        style={{ 
                                            width: `${Math.max(5, (cat.productCount / Math.max(1, stats.totalProducts)) * 100)}%` 
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-card">
                    <div className="dashboard-card-header">
                        <h2>Quick Actions</h2>
                    </div>
                    <div className="quick-actions-grid">
                        <a href="/admin/products/new" className="quick-action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add New Product
                        </a>
                        <a href="/admin/homepage" className="quick-action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Manage Homepage
                        </a>
                        <a href="/admin/products?filter=out-of-stock" className="quick-action-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            View Out of Stock
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
