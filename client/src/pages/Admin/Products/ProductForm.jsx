import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../../context/ToastContext';
import './ProductForm.css';

const ProductForm = () => {
    const { id } = useParams();
    const isEditMode = !!id;
    const navigate = useNavigate();
    const toast = useToast();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        shortDescription: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stock: 0,
        totalSold: 0,
        inStock: true,
        isFeatured: false,
        isOffer: false,
        offerLabel: '',
        manualNew: 'null', // 'null' string for auto, 'true', 'false'
        manualBestseller: 'null',
        benefits: [''],
        howToUse: '',
        ingredients: ['']
    });

    // Image State
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch categories
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                setCategories(catData);

                // Fetch product if edit mode
                if (isEditMode) {
                    const prodRes = await fetch(`/api/admin/products/${id}`);
                    if (!prodRes.ok) throw new Error('Product not found');
                    const product = await prodRes.json();
                    
                    setFormData({
                        name: product.name || '',
                        slug: product.slug || '',
                        shortDescription: product.shortDescription || '',
                        description: product.description || '',
                        price: product.price || '',
                        discountPrice: product.discountPrice || '',
                        category: product.category?._id || product.category || '',
                        stock: product.stock || 0,
                        totalSold: product.totalSold || 0,
                        inStock: product.inStock,
                        isFeatured: product.isFeatured,
                        isOffer: product.isOffer || false,
                        offerLabel: product.offerLabel || '',
                        manualNew: product.manualNew === null ? 'null' : product.manualNew.toString(),
                        manualBestseller: product.manualBestseller === null ? 'null' : product.manualBestseller.toString(),
                        benefits: product.benefits?.length ? product.benefits : [''],
                        howToUse: product.howToUse || '',
                        ingredients: product.ingredients?.length ? product.ingredients : ['']
                    });

                    setExistingImages(product.images || []);
                }
            } catch (error) {
                toast.error(error.message);
                if (isEditMode) navigate('/admin/products');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEditMode, navigate, toast]);

    // Handle standard inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Auto-generate slug from name
    const generateSlug = () => {
        if (!formData.name) return;
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug }));
    };

    // Handle dynamic lists (benefits, ingredients)
    const handleArrayChange = (index, field, value) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field) => {
        setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
    };

    const removeArrayItem = (index, field) => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, [field]: newArray.length ? newArray : [''] }));
    };

    // Handle Images
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + existingImages.length + newImages.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        setNewImages(prev => [...prev, ...files]);
        
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
    };

    const removeExistingImage = (index) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.category) {
            toast.error('Please select a category');
            return;
        }

        setSaving(true);

        try {
            const formDataToSend = new FormData();
            
            // Append standard fields
            Object.keys(formData).forEach(key => {
                if (key === 'benefits' || key === 'ingredients') {
                    // Only send non-empty items
                    const filtered = formData[key].filter(i => i.trim() !== '');
                    formDataToSend.append(key, JSON.stringify(filtered));
                } else {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append existing images
            existingImages.forEach(img => {
                formDataToSend.append('existingImages', img);
            });

            // Append new images
            newImages.forEach(file => {
                formDataToSend.append('images', file);
            });

            const url = isEditMode ? `/api/admin/products/${id}` : '/api/admin/products';
            const method = isEditMode ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                body: formDataToSend // No content-type header needed for FormData
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to save product');
            }

            toast.success(`Product ${isEditMode ? 'updated' : 'created'} successfully`);
            navigate('/admin/products');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading product details...</p>
        </div>
    );

    return (
        <div className="product-form-container">
            <div className="admin-page-header">
                <h2>{isEditMode ? 'Edit Product' : 'Add New Product'}</h2>
                <Link to="/admin/products" className="admin-btn-secondary">
                    Cancel
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-grid">
                    {/* Left Column - Main Info */}
                    <div className="form-column">
                        <div className="form-section">
                            <h3>Basic Information</h3>
                            
                            <div className="form-group">
                                <label>Product Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleChange} 
                                    required 
                                    placeholder="e.g. Yarsagumba"
                                    onBlur={!isEditMode && !formData.slug ? generateSlug : undefined}
                                />
                            </div>

                            <div className="form-group">
                                <label>Slug *</label>
                                <div className="slug-input-wrapper">
                                    <input 
                                        type="text" 
                                        name="slug" 
                                        value={formData.slug} 
                                        onChange={handleChange} 
                                        required 
                                        placeholder="e.g. yarsagumba"
                                    />
                                    <button type="button" onClick={generateSlug} className="btn-generate">
                                        Generate
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Category *</label>
                                <select 
                                    name="category" 
                                    value={formData.category} 
                                    onChange={handleChange} 
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat._id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Short Description *</label>
                                <input 
                                    type="text" 
                                    name="shortDescription" 
                                    value={formData.shortDescription} 
                                    onChange={handleChange} 
                                    required 
                                    maxLength={150}
                                    placeholder="Brief summary for product cards..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Full Description</label>
                                <textarea 
                                    name="description" 
                                    value={formData.description} 
                                    onChange={handleChange} 
                                    rows="5"
                                    placeholder="Detailed product description..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Images (Max 5)</h3>
                            
                            <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                                <input 
                                    type="file" 
                                    multiple 
                                    accept="image/*" 
                                    onChange={handleImageSelect} 
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                />
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <p>Click to select images</p>
                            </div>

                            <div className="image-previews">
                                {existingImages.map((img, idx) => (
                                    <div key={`exist-${idx}`} className="preview-item">
                                        <img src={img} alt="Existing" />
                                        <button type="button" onClick={() => removeExistingImage(idx)} className="btn-remove-img">×</button>
                                        <span className="img-badge">Existing</span>
                                    </div>
                                ))}
                                {previewUrls.map((url, idx) => (
                                    <div key={`new-${idx}`} className="preview-item">
                                        <img src={url} alt="New" />
                                        <button type="button" onClick={() => removeNewImage(idx)} className="btn-remove-img">×</button>
                                        <span className="img-badge new">New</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="form-section">
                            <h3>Product Details Lists</h3>
                            
                            <div className="form-group">
                                <label>Benefits</label>
                                {formData.benefits.map((benefit, idx) => (
                                    <div key={`benefit-${idx}`} className="dynamic-input-row">
                                        <input 
                                            type="text" 
                                            value={benefit} 
                                            onChange={(e) => handleArrayChange(idx, 'benefits', e.target.value)}
                                            placeholder="e.g. Boosts immunity"
                                        />
                                        <button type="button" onClick={() => removeArrayItem(idx, 'benefits')} className="btn-remove-row">×</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('benefits')} className="btn-add-row">+ Add Benefit</button>
                            </div>

                            <div className="form-group">
                                <label>Ingredients</label>
                                {formData.ingredients.map((ingredient, idx) => (
                                    <div key={`ingredient-${idx}`} className="dynamic-input-row">
                                        <input 
                                            type="text" 
                                            value={ingredient} 
                                            onChange={(e) => handleArrayChange(idx, 'ingredients', e.target.value)}
                                            placeholder="e.g. 100% Pure Extract"
                                        />
                                        <button type="button" onClick={() => removeArrayItem(idx, 'ingredients')} className="btn-remove-row">×</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addArrayItem('ingredients')} className="btn-add-row">+ Add Ingredient</button>
                            </div>

                            <div className="form-group">
                                <label>How To Use</label>
                                <textarea 
                                    name="howToUse" 
                                    value={formData.howToUse} 
                                    onChange={handleChange} 
                                    rows="3"
                                    placeholder="Usage instructions..."
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pricing, Stock, Tags */}
                    <div className="form-column">
                        <div className="form-section">
                            <h3>Pricing (NPR)</h3>
                            
                            <div className="form-group">
                                <label>Regular Price *</label>
                                <input 
                                    type="number" 
                                    name="price" 
                                    value={formData.price} 
                                    onChange={handleChange} 
                                    required 
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Discount Price (Optional)</label>
                                <input 
                                    type="number" 
                                    name="discountPrice" 
                                    value={formData.discountPrice} 
                                    onChange={handleChange} 
                                    min="0"
                                />
                                <span className="input-hint">Leave empty if no discount</span>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Inventory</h3>
                            
                            <div className="form-group checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id="inStock" 
                                    name="inStock" 
                                    checked={formData.inStock} 
                                    onChange={handleChange} 
                                />
                                <label htmlFor="inStock">Product is In Stock</label>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Stock Count</label>
                                    <input 
                                        type="number" 
                                        name="stock" 
                                        value={formData.stock} 
                                        onChange={handleChange} 
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Sold (Manual override)</label>
                                    <input 
                                        type="number" 
                                        name="totalSold" 
                                        value={formData.totalSold} 
                                        onChange={handleChange} 
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>Tags & Badges</h3>
                            
                            <div className="form-group checkbox-group">
                                <input 
                                    type="checkbox" 
                                    id="isFeatured" 
                                    name="isFeatured" 
                                    checked={formData.isFeatured} 
                                    onChange={handleChange} 
                                />
                                <label htmlFor="isFeatured" className="featured-label">Featured Product</label>
                            </div>

                            <div className="form-group tag-control">
                                <label>New Badge Logic</label>
                                <select name="manualNew" value={formData.manualNew} onChange={handleChange}>
                                    <option value="null">Auto (Last 30 days)</option>
                                    <option value="true">Force Show "New"</option>
                                    <option value="false">Force Hide "New"</option>
                                </select>
                            </div>

                            <div className="form-group tag-control">
                                <label>Bestseller Badge Logic</label>
                                <select name="manualBestseller" value={formData.manualBestseller} onChange={handleChange}>
                                    <option value="null">Auto (Based on Total Sold)</option>
                                    <option value="true">Force Show "Bestseller"</option>
                                    <option value="false">Force Hide "Bestseller"</option>
                                </select>
                            </div>

                            <div className="offer-box">
                                <div className="form-group checkbox-group">
                                    <input 
                                        type="checkbox" 
                                        id="isOffer" 
                                        name="isOffer" 
                                        checked={formData.isOffer} 
                                        onChange={handleChange} 
                                    />
                                    <label htmlFor="isOffer">Enable Special Offer</label>
                                </div>
                                
                                {formData.isOffer && (
                                    <div className="form-group mt-3">
                                        <label>Offer Label text</label>
                                        <input 
                                            type="text" 
                                            name="offerLabel" 
                                            value={formData.offerLabel} 
                                            onChange={handleChange} 
                                            placeholder="e.g. Buy 2 Get 1 Free"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="admin-btn-save" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
