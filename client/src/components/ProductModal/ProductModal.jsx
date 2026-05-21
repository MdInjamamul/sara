import { useState, useEffect } from 'react';
import './ProductModal.css';

const ProductModal = ({ isOpen, onClose, onSave, initialData, categories, onToast }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        shortDescription: '',
        category: 'all',
        price: '',
        originalPrice: '',
        images: [],
        isNew: false,
        benefits: '',
        benefits: '',
        howToUse: '',
        ingredients: '',
        stock: '',
        variantOptions: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                description: initialData.description || '',
                shortDescription: initialData.shortDescription || '',
                category: initialData.categorySlug || initialData.category || 'all',
                price: initialData.price || '',
                originalPrice: initialData.originalPrice || '',
                images: initialData.images || (initialData.image && initialData.image !== '/assets/images/placeholder.png' ? [initialData.image] : []),
                isNew: initialData.isNew || false,
                benefits: initialData.benefits ? initialData.benefits.join('\n') : '',
                howToUse: initialData.howToUse || '',
                ingredients: initialData.ingredients ? initialData.ingredients.join('\n') : '',
                stock: initialData.stock !== undefined ? initialData.stock : '',
                variantOptions: initialData.variants && initialData.variants.length > 0 
                    ? initialData.variants.map(v => v.name).join(', ') 
                    : ''
            });
        } else {
            // Reset for new product
            setFormData({
                name: '',
                slug: '',
                description: '',
                shortDescription: '',
                category: categories[1]?.value || 'medicinal-herbs',
                price: '',
                originalPrice: '',
                images: [],
                isNew: false,
                benefits: '',
                howToUse: '',
                ingredients: '',
                stock: '',
                variantOptions: ''
            });
        }
    }, [initialData, isOpen, categories]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Auto-generate slug from name if name is changed
        if (name === 'name') {
            setFormData(prev => ({
                ...prev,
                slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }));
        }
    };

    // Variant helpers removed since we use a single comma-separated string now

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.name || !formData.price || !formData.category) {
            onToast('Please fill in all required fields (Name, Price, Category)', 'error');
            return;
        }

        if (formData.originalPrice && Number(formData.price) >= Number(formData.originalPrice)) {
            onToast('Current price must be less than the original price', 'error');
            return;
        }

        const productToSave = {
            ...formData,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
            stock: formData.stock !== '' ? Number(formData.stock) : 0,
            benefits: formData.benefits ? formData.benefits.split('\n').map(s => s.trim()).filter(Boolean) : [],
            ingredients: formData.ingredients ? formData.ingredients.split('\n').map(s => s.trim()).filter(Boolean) : [],
            variants: formData.variantOptions ? formData.variantOptions.split(',').map(name => ({
                name: name.trim(),
                price: Number(formData.price),
                discountPrice: formData.originalPrice ? Number(formData.price) : null,
                stock: formData.stock !== '' ? Number(formData.stock) : 0
            })).filter(v => v.name) : []
        };

        if (initialData && initialData.id) {
            productToSave.id = initialData.id;
        }

        onSave(productToSave);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || e.dataTransfer?.files || []);
        if (files.length === 0) return;

        if (formData.images.length + files.length > 5) {
            if (onToast) onToast('Maximum 5 images allowed', 'error');
            return;
        }

        const newImages = [...formData.images];
        let hasError = false;

        for (const file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const uploadData = new FormData();
                    uploadData.append('image', file);

                    const response = await fetch('http://localhost:5000/api/upload', {
                        method: 'POST',
                        body: uploadData
                    });

                    if (!response.ok) throw new Error('Upload failed');
                    
                    const data = await response.json();
                    newImages.push(`http://localhost:5000${data.imageUrl}`);
                } catch (err) {
                    hasError = true;
                }
            }
        }
        
        setFormData(prev => ({ ...prev, images: newImages }));
        
        if (onToast) {
            if (hasError) {
                onToast('Some images failed to upload', 'error');
            } else {
                onToast('Images uploaded successfully', 'success');
            }
        }
    };

    const removeImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleImageUpload(e);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{initialData ? 'Edit Product' : 'Add New Product'}</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-group">
                        <label htmlFor="name">Product Name *</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            placeholder="e.g. Organic Turmeric Powder"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="shortDescription">Short Description *</label>
                        <input 
                            type="text" 
                            id="shortDescription" 
                            name="shortDescription" 
                            value={formData.shortDescription} 
                            onChange={handleChange} 
                            required 
                            placeholder="A brief 1-sentence summary"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Full Description *</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            required 
                            rows="4"
                            placeholder="Detailed product description..."
                            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontFamily: 'var(--font-body)', fontSize: '1rem', resize: 'vertical' }}
                        ></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="category">Category *</label>
                            <select 
                                id="category" 
                                name="category" 
                                value={formData.category} 
                                onChange={handleChange}
                                required
                            >
                                {categories.filter(c => c.value !== 'all').map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group half">
                            <label htmlFor="slug">Slug (Auto-generated)</label>
                            <input 
                                type="text" 
                                id="slug" 
                                name="slug" 
                                value={formData.slug} 
                                onChange={handleChange} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="price">Current Price (NPR) *</label>
                            <input 
                                type="number" 
                                id="price" 
                                name="price" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required 
                                min="0" 
                                step="0.01"
                            />
                        </div>
                        <div className="form-group half">
                            <label htmlFor="originalPrice">Original Price (NPR)</label>
                            <input 
                                type="number" 
                                id="originalPrice" 
                                name="originalPrice" 
                                value={formData.originalPrice} 
                                onChange={handleChange} 
                                min="0" 
                                step="0.01"
                                placeholder="Optional"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label htmlFor="stock">Total Stock</label>
                            <input 
                                type="number" 
                                id="stock" 
                                name="stock" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                min="0"
                                placeholder="0"
                            />
                        </div>
                        <div className="form-group half checkbox-group">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    name="isNew" 
                                    checked={formData.isNew} 
                                    onChange={handleChange} 
                                />
                                Mark as New Product
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Product Images (Max 5)</label>
                        <div 
                            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('image-upload').click()}
                            style={{ minHeight: '120px' }}
                        >
                            <input 
                                type="file" 
                                id="image-upload" 
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload} 
                                style={{ display: 'none' }}
                            />
                            
                            <div className="drop-zone-placeholder">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <p>Drag & Drop images or click here</p>
                            </div>
                        </div>

                        {formData.images.length > 0 && (
                            <div className="image-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px', marginTop: '10px' }}>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                                        <img src={img} alt={`Preview ${idx + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button 
                                            type="button" 
                                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(231, 76, 60, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                                            title="Remove image"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="benefits">Benefits (One per line)</label>
                        <textarea
                            id="benefits"
                            name="benefits"
                            value={formData.benefits}
                            onChange={handleChange}
                            placeholder="e.g.&#10;Boosts immunity&#10;Improves sleep"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="howToUse">How to Use</label>
                        <textarea
                            id="howToUse"
                            name="howToUse"
                            value={formData.howToUse}
                            onChange={handleChange}
                            placeholder="Enter instructions on how to use the product"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="ingredients">Ingredients (One per line)</label>
                        <textarea
                            id="ingredients"
                            name="ingredients"
                            value={formData.ingredients}
                            onChange={handleChange}
                            placeholder="e.g.&#10;Ashwagandha Root&#10;Tulasi Leaves"
                            rows="3"
                        ></textarea>
                    </div>

                    <div className="form-group full-width">
                        <label htmlFor="variantOptions">Product Options / Variants (Comma separated)</label>
                        <input 
                            type="text" 
                            id="variantOptions" 
                            name="variantOptions" 
                            value={formData.variantOptions} 
                            onChange={handleChange} 
                            placeholder="e.g. 100g, 250g, 500g or Red, Blue"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>These options will be available for customers to select on the product page.</p>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-save">
                            {initialData ? 'Save Changes' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductModal;
