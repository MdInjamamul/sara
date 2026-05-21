const Product = require('../models/Product');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

// @desc    Get all products (admin view with pagination)
// @route   GET /api/admin/products
const getAllProductsAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const categorySlug = req.query.category || '';
        const stockFilter = req.query.filter === 'out-of-stock' ? { inStock: false } : {};

        let query = { ...stockFilter };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (categorySlug && categorySlug !== 'all') {
            query.categorySlug = categorySlug;
        }

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product by ID
// @route   GET /api/admin/products/:id
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/admin/products
const createProduct = async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(400).json({ message: 'Invalid category' });
        }

        // Handle image upload
        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => `/uploads/${file.filename}`);
        } else if (req.body.existingImages) {
             // For backwards compatibility or if they provide an existing URL
             images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }

        const productData = {
            ...req.body,
            categorySlug: category.slug,
            images,
            // Parse arrays if they come as strings
            benefits: req.body.benefits ? JSON.parse(req.body.benefits) : [],
            ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : [],
            // Convert booleans
            inStock: req.body.inStock === 'true' || req.body.inStock === true,
            isFeatured: req.body.isFeatured === 'true' || req.body.isFeatured === true,
            manualNew: req.body.manualNew === 'null' ? null : (req.body.manualNew === 'true' || req.body.manualNew === true),
            manualBestseller: req.body.manualBestseller === 'null' ? null : (req.body.manualBestseller === 'true' || req.body.manualBestseller === true),
            isOffer: req.body.isOffer === 'true' || req.body.isOffer === true,
        };

        const product = new Product(productData);
        const createdProduct = await product.save();

        // Update category count
        const count = await Product.countDocuments({ category: category._id });
        await Category.findByIdAndUpdate(category._id, { productCount: count });

        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const oldCategoryId = product.category;
        
        let newCategorySlug = product.categorySlug;
        if (req.body.category && req.body.category !== product.category.toString()) {
            const category = await Category.findById(req.body.category);
            if (!category) {
                return res.status(400).json({ message: 'Invalid category' });
            }
            newCategorySlug = category.slug;
        }

        // Handle image upload
        let images = req.body.existingImages ? 
            (Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages]) : 
            [];
            
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => `/uploads/${file.filename}`);
            images = [...images, ...newImages];
        }

        // Delete removed images from filesystem if needed (optional optimization)
        // const removedImages = product.images.filter(img => !images.includes(img) && img.startsWith('/uploads/'));
        // removedImages.forEach(img => {
        //     const filePath = path.join(__dirname, '..', img);
        //     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        // });

        const updateData = {
            ...req.body,
            categorySlug: newCategorySlug,
            images,
            benefits: req.body.benefits ? JSON.parse(req.body.benefits) : product.benefits,
            ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : product.ingredients,
        };

        // Convert string booleans to actual booleans
        if (req.body.inStock !== undefined) updateData.inStock = req.body.inStock === 'true' || req.body.inStock === true;
        if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
        if (req.body.isOffer !== undefined) updateData.isOffer = req.body.isOffer === 'true' || req.body.isOffer === true;
        if (req.body.manualNew !== undefined) updateData.manualNew = req.body.manualNew === 'null' ? null : (req.body.manualNew === 'true' || req.body.manualNew === true);
        if (req.body.manualBestseller !== undefined) updateData.manualBestseller = req.body.manualBestseller === 'null' ? null : (req.body.manualBestseller === 'true' || req.body.manualBestseller === true);

        // Update product using findByIdAndUpdate to bypass some hooks if needed, but save() is better for pre-save hooks
        Object.assign(product, updateData);
        const updatedProduct = await product.save();

        // Update category counts if category changed
        if (req.body.category && req.body.category !== oldCategoryId.toString()) {
            const oldCount = await Product.countDocuments({ category: oldCategoryId });
            await Category.findByIdAndUpdate(oldCategoryId, { productCount: oldCount });
            
            const newCount = await Product.countDocuments({ category: req.body.category });
            await Category.findByIdAndUpdate(req.body.category, { productCount: newCount });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a product
// @route   DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const categoryId = product.category;

        // Delete associated images if they are in uploads dir
        if (product.images && product.images.length > 0) {
            product.images.forEach(img => {
                if (img.startsWith('/uploads/')) {
                    const filePath = path.join(__dirname, '..', img);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
            });
        }

        await Product.deleteOne({ _id: product._id });

        // Update category count
        const count = await Product.countDocuments({ category: categoryId });
        await Category.findByIdAndUpdate(categoryId, { productCount: count });

        res.json({ message: 'Product removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllProductsAdmin,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
