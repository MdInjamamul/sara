const productRepository = require('../repositories/productRepository');
const categoryRepository = require('../repositories/categoryRepository');
const AppError = require('../utils/AppError');
const fs = require('fs');
const path = require('path');

/**
 * Product Service — All business logic lives here.
 * Calls the Repository for data access.
 * Throws AppError when business rules are violated.
 */

/**
 * Get all products with optional filters.
 */
const getAllProducts = async (queryParams) => {
    const filter = {};

    if (queryParams.category) {
        filter.categorySlug = queryParams.category;
    }
    if (queryParams.featured === 'true') {
        filter.isFeatured = true;
    }

    const options = {};
    if (queryParams.limit) {
        options.limit = queryParams.limit;
    }

    return productRepository.findAll(filter, options);
};

/**
 * Get a single product by slug.
 */
const getProductBySlug = async (slug) => {
    const product = await productRepository.findBySlug(slug);
    if (!product) {
        throw new AppError('Product not found', 404);
    }
    return product;
};

/**
 * Get trending products (new or bestseller).
 */
const getTrendingProducts = async () => {
    const filter = {
        $or: [{ isNew: true }, { isBestseller: true }]
    };
    return productRepository.findAll(filter, { limit: 6 });
};

/**
 * Get featured products.
 */
const getFeaturedProducts = async () => {
    return productRepository.findAll({ isFeatured: true }, { limit: 8 });
};

/**
 * Create a new product.
 * Business rule: Category must exist before we can assign it.
 */
const createProduct = async (dto) => {
    // Verify the category exists
    const categoryObj = await categoryRepository.findBySlug(dto.categorySlug);
    if (!categoryObj) {
        throw new AppError('Category not found', 404);
    }

    const productData = {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        price: dto.price,
        discountPrice: dto.discountPrice,
        categorySlug: dto.categorySlug,
        category: categoryObj._id,
        images: dto.image ? [dto.image] : [],
        isNew: dto.isNew || false,
        stock: dto.stock || 0,
        inStock: (dto.stock || 0) > 0,
        benefits: dto.benefits || [],
        howToUse: dto.howToUse || '',
        ingredients: dto.ingredients || []
    };

    return productRepository.create(productData);
};

/**
 * Update an existing product.
 * Business rules:
 *  - Product must exist
 *  - If categorySlug changed, new category must exist
 *  - If image changed, delete old image from disk
 */
const updateProduct = async (id, dto) => {
    const product = await productRepository.findById(id);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // If category is changing, verify new category exists
    if (dto.categorySlug && dto.categorySlug !== product.categorySlug) {
        const categoryObj = await categoryRepository.findBySlug(dto.categorySlug);
        if (!categoryObj) {
            throw new AppError('Category not found', 404);
        }
        product.category = categoryObj._id;
        product.categorySlug = dto.categorySlug;
    }

    // Apply partial updates
    if (dto.name !== undefined) product.name = dto.name;
    if (dto.slug !== undefined) product.slug = dto.slug;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.shortDescription !== undefined) product.shortDescription = dto.shortDescription;
    if (dto.price !== undefined) product.price = dto.price;
    if (dto.discountPrice !== undefined) product.discountPrice = dto.discountPrice;
    if (dto.isNew !== undefined) product.isNew = dto.isNew;
    if (dto.stock !== undefined) {
        product.stock = dto.stock;
        product.inStock = dto.stock > 0;
    }
    if (dto.benefits !== undefined) product.benefits = dto.benefits;
    if (dto.howToUse !== undefined) product.howToUse = dto.howToUse;
    if (dto.ingredients !== undefined) product.ingredients = dto.ingredients;

    // Handle image replacement — delete old image from disk
    if (dto.image) {
        if (product.images && product.images.length > 0 && product.images[0] !== dto.image) {
            deleteImageFromDisk(product.images[0]);
        }
        product.images = [dto.image];
    }

    return productRepository.update(product);
};

/**
 * Delete a product and its associated images from disk.
 */
const deleteProduct = async (id) => {
    const product = await productRepository.findById(id);
    if (!product) {
        throw new AppError('Product not found', 404);
    }

    // Clean up images from disk
    if (product.images && product.images.length > 0) {
        product.images.forEach((imagePath) => deleteImageFromDisk(imagePath));
    }

    await productRepository.remove(product);
    return { message: 'Product removed' };
};

// ─── Private Helpers ────────────────────────────────────

/**
 * Safely deletes an image file from the /uploads/ directory.
 * Silently ignores files that don't exist (ENOENT).
 */
const deleteImageFromDisk = (imagePath) => {
    if (!imagePath || !imagePath.includes('/uploads/')) return;

    const parts = imagePath.split('/uploads/');
    const fileName = parts[parts.length - 1];
    const fullPath = path.join(__dirname, '..', 'uploads', fileName);

    fs.unlink(fullPath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error(`Error deleting image file: ${fullPath}`, err);
        }
    });
};

module.exports = {
    getAllProducts,
    getProductBySlug,
    getTrendingProducts,
    getFeaturedProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
