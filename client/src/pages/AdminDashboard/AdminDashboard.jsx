import { useState, useMemo, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import ProductModal from '../../components/ProductModal/ProductModal';
import Toast from '../../components/Toast/Toast';
import './AdminDashboard.css';

// Map MongoDB product to UI state format
const formatProduct = (p) => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    shortDescription: p.shortDescription,
    price: p.discountPrice ? p.discountPrice : p.price,
    originalPrice: p.discountPrice ? p.price : null,
    image: p.images && p.images.length > 0 ? p.images[0] : '/assets/images/placeholder.png',
    category: p.categorySlug,
    isNew: p.isNew,
    stock: p.stock || 0,
    inStock: p.inStock,
    benefits: p.benefits || [],
    howToUse: p.howToUse || '',
    ingredients: p.ingredients || []
});

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'medicinal-herbs', label: 'Medicinal Herbs' },
    { value: 'essential-oils', label: 'Essential Oils' },
    { value: 'herbal-oils', label: 'Herbal Oils' },
    { value: 'superfoods', label: 'Super Foods' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'spices', label: 'Spices' },
    { value: 'spiritual-items', label: 'Spiritual Items' },
    { value: 'nursery', label: 'Nursery' }
];

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/products');
                const data = await res.json();
                setProducts(data.map(formatProduct));
                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, productId: null });

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const handleDeleteClick = (id) => {
        setDeleteConfirm({ isOpen: true, productId: id });
    };

    const confirmDelete = async () => {
        const id = deleteConfirm.productId;
        if (!id) return;
        
        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete product');
            setProducts(products.filter(p => p.id !== id));
            showToast('Product deleted successfully');
        } catch (error) {
            showToast(error.message, 'error');
        } finally {
            setDeleteConfirm({ isOpen: false, productId: null });
        }
    };

    const handleEdit = (id) => {
        const productToEdit = products.find(p => p.id === id);
        setEditingProduct(productToEdit);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (savedProduct) => {
        try {
            const isEditing = !!savedProduct.id;
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing 
                ? `http://localhost:5000/api/products/${savedProduct.id}` 
                : 'http://localhost:5000/api/products';

            const bodyData = {
                name: savedProduct.name,
                slug: savedProduct.slug,
                description: savedProduct.description,
                shortDescription: savedProduct.shortDescription,
                price: savedProduct.originalPrice ? Number(savedProduct.originalPrice) : Number(savedProduct.price),
                discountPrice: savedProduct.originalPrice ? Number(savedProduct.price) : null,
                categorySlug: savedProduct.category,
                image: savedProduct.image,
                isNew: savedProduct.isNew,
                benefits: savedProduct.benefits,
                howToUse: savedProduct.howToUse,
                ingredients: savedProduct.ingredients
            };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to save product');

            const formattedProduct = formatProduct(data);

            if (isEditing) {
                setProducts(products.map(p => p.id === savedProduct.id ? formattedProduct : p));
                showToast('Product updated successfully');
            } else {
                setProducts([formattedProduct, ...products]);
                showToast('Product added successfully');
            }
            setIsModalOpen(false);
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setStatusFilter('all');
        setMinPrice('');
        setMaxPrice('');
    };

    // Derived state for filtered products
    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
            const matchesStatus = statusFilter === 'all' || (statusFilter === 'new' ? p.isNew : !p.isNew);
            const matchesMinPrice = minPrice === '' || p.price >= Number(minPrice);
            const matchesMaxPrice = maxPrice === '' || p.price <= Number(maxPrice);

            return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
        });
    }, [products, searchTerm, categoryFilter, statusFilter, minPrice, maxPrice]);

    return (
        <AdminLayout>
            <div className="admin-header-flex">
                        <h1 className="admin-title">Product Dashboard</h1>
                        <button className="add-product-btn" onClick={handleAdd}>
                            + Add New Product
                        </button>
                    </div>

                    <div className="admin-header">
                        <p className="admin-count">
                            {isLoading ? 'Loading products...' : `Managing ${products.length} Products`}
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="filters-container">
                        <div className="filters-header">
                            <h3>Filter Products</h3>
                            <button className="reset-filters-btn" onClick={handleResetFilters}>Reset Filters</button>
                        </div>
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label htmlFor="search">Product Name</label>
                                <input 
                                    type="text" 
                                    id="search"
                                    placeholder="Search by name..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="filter-input"
                                />
                            </div>
                            
                            <div className="filter-group">
                                <label htmlFor="category">Category</label>
                                <select 
                                    id="category"
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="status">Status</label>
                                <select 
                                    id="status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="new">New</option>
                                    <option value="standard">Standard</option>
                                </select>
                            </div>

                            <div className="filter-group price-filter-group">
                                <label>Price Range (NPR)</label>
                                <div className="price-inputs">
                                    <input 
                                        type="number" 
                                        placeholder="Min" 
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="filter-input"
                                        min="0"
                                    />
                                    <span>-</span>
                                    <input 
                                        type="number" 
                                        placeholder="Max" 
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="filter-input"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="table-container">
                        <div className="table-results-info">
                            <p>Showing {filteredProducts.length} result(s)</p>
                        </div>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>S.N.</th>
                                    <th>Image</th>
                                    <th>Product Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="table-id">{index + 1}</td>
                                        <td className="table-img-cell">
                                            <div className="table-img-wrapper">
                                                <img src={product.image} alt={product.name} />
                                            </div>
                                        </td>
                                        <td className="table-name">{product.name}</td>
                                        <td className="table-category">
                                            <span className="category-badge">{product.category.replace('-', ' ')}</span>
                                        </td>
                                        <td className="table-price">
                                            <span className="current-price">NPR {product.price?.toFixed(2)}</span>
                                            {product.originalPrice && (
                                                <span className="original-price">NPR {product.originalPrice?.toFixed(2)}</span>
                                            )}
                                        </td>
                                        <td className="table-status">
                                            {product.isNew ? (
                                                <span className="status-badge new">New</span>
                                            ) : (
                                                <span className="status-badge standard">Standard</span>
                                            )}
                                        </td>
                                        <td className="table-actions">
                                            <button className="admin-btn edit-btn" onClick={() => handleEdit(product.id)}>
                                                Edit
                                            </button>
                                            <button className="admin-btn delete-btn" onClick={() => handleDeleteClick(product.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredProducts.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="empty-state">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--color-text-muted)', marginBottom: '1rem'}}>
                                                <circle cx="11" cy="11" r="8"></circle>
                                                <path d="m21 21-4.3-4.3"></path>
                                            </svg>
                                            <p>No products match your filters.</p>
                                            <button className="reset-link-btn" onClick={handleResetFilters}>Clear all filters</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
            <ProductModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveProduct}
                initialData={editingProduct}
                categories={categories}
                onToast={showToast}
            />
            <Toast 
                message={toast.message} 
                type={toast.type} 
                onClose={() => setToast({ message: '', type: 'success' })} 
            />

            {deleteConfirm.isOpen && (
                <div className="delete-modal-overlay">
                    <div className="delete-modal-content">
                        <h3>Confirm Deletion</h3>
                        <p>Are you sure you want to delete this product? This action cannot be undone.</p>
                        <div className="delete-modal-actions">
                            <button className="delete-modal-cancel" onClick={() => setDeleteConfirm({ isOpen: false, productId: null })}>Cancel</button>
                            <button className="delete-modal-confirm" onClick={confirmDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminDashboard;
