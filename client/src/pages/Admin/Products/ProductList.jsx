import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination & Filters
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all'); // 'all', 'out-of-stock'

    const toast = useToast();

    // Fetch categories for filter dropdown
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                const data = await res.json();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products based on filters
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let url = `/api/admin/products?page=${page}&limit=10`;
                if (search) url += `&search=${search}`;
                if (categoryFilter !== 'all') url += `&category=${categoryFilter}`;
                if (stockFilter !== 'all') url += `&filter=${stockFilter}`;

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch products');
                
                const data = await res.json();
                setProducts(data.products);
                setTotalPages(data.pages);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        };

        // Debounce search
        const timeoutId = setTimeout(fetchProducts, 300);
        return () => clearTimeout(timeoutId);
    }, [page, search, categoryFilter, stockFilter, toast]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to delete product');
            }

            toast.success('Product deleted successfully');
            
            // Refresh list
            setProducts(products.filter(p => p._id !== id));
            // If page is now empty and not first page, go back
            if (products.length === 1 && page > 1) {
                setPage(page - 1);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleStockToggle = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: !currentStatus })
            });

            if (!res.ok) throw new Error('Failed to update stock status');

            toast.success('Stock status updated');
            setProducts(products.map(p => 
                p._id === id ? { ...p, inStock: !currentStatus } : p
            ));
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <div className="admin-product-list">
            <div className="admin-page-header">
                <h2>Products Management</h2>
                <Link to="/admin/products/new" className="admin-btn-primary">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Product
                </Link>
            </div>

            <div className="admin-filters-bar">
                <div className="search-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="filter-group">
                    <select 
                        value={categoryFilter} 
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(1);
                        }}
                        className="admin-select"
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat._id} value={cat.slug}>{cat.name}</option>
                        ))}
                    </select>

                    <select 
                        value={stockFilter} 
                        onChange={(e) => {
                            setStockFilter(e.target.value);
                            setPage(1);
                        }}
                        className="admin-select"
                    >
                        <option value="all">All Stock Status</option>
                        <option value="out-of-stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                {loading ? (
                    <div className="admin-loading-table">
                        <div className="admin-spinner"></div>
                        <p>Loading products...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="admin-empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                            <line x1="12" y1="22.08" x2="12" y2="12" />
                        </svg>
                        <p>No products found</p>
                    </div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price (NPR)</th>
                                <th>Stock Status</th>
                                <th>Tags</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="product-cell-info">
                                            <div className="product-cell-img">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} />
                                                ) : (
                                                    <div className="img-placeholder">No Img</div>
                                                )}
                                            </div>
                                            <div className="product-cell-details">
                                                <strong>{product.name}</strong>
                                                <span>Total Sold: {product.totalSold || 0}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">
                                            {product.category?.name || product.categorySlug}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="price-cell">
                                            {product.discountPrice ? (
                                                <>
                                                    <span className="current-price">Rs. {product.discountPrice.toLocaleString()}</span>
                                                    <span className="original-price">Rs. {product.price.toLocaleString()}</span>
                                                </>
                                            ) : (
                                                <span className="current-price">Rs. {product.price.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            className={`stock-toggle-btn ${product.inStock ? 'in-stock' : 'out-of-stock'}`}
                                            onClick={() => handleStockToggle(product._id, product.inStock)}
                                            title="Click to toggle"
                                        >
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </button>
                                        <div className="stock-count-text">
                                            Count: {product.stock || 0}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="tags-cell">
                                            {product.isFeatured && <span className="tag-badge featured">Featured</span>}
                                            {product.isBestseller && <span className="tag-badge bestseller">Bestseller</span>}
                                            {product.isNew && <span className="tag-badge new">New</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            <Link to={`/admin/products/edit/${product._id}`} className="action-btn edit-btn" title="Edit">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                </svg>
                                            </Link>
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => handleDelete(product._id, product.name)}
                                                title="Delete"
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    <line x1="10" y1="11" x2="10" y2="17" />
                                                    <line x1="14" y1="11" x2="14" y2="17" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="admin-pagination">
                        <button 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                            className="pagination-btn"
                        >
                            Prev
                        </button>
                        <span className="pagination-info">Page {page} of {totalPages}</span>
                        <button 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
