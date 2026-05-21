/**
 * Output DTO for a Product.
 * Takes a raw Mongoose document and returns a clean, whitelisted object.
 * - Renames _id to id
 * - Strips __v, timestamps, and internal fields
 * - Preserves the populated category object
 *
 * IMPORTANT: The returned shape matches what the current frontend expects,
 * so no UI changes are needed.
 */
const productDto = (doc) => {
    if (!doc) return null;

    // Convert Mongoose document to plain object if needed
    const obj = doc.toObject ? doc.toObject() : doc;

    return {
        _id: obj._id,
        name: obj.name,
        slug: obj.slug,
        description: obj.description,
        shortDescription: obj.shortDescription,
        price: obj.price,
        discountPrice: obj.discountPrice,
        category: obj.category,         // populated Category object or ObjectId
        categorySlug: obj.categorySlug,
        images: obj.images || [],
        inStock: obj.inStock,
        stock: obj.stock,
        isFeatured: obj.isFeatured,
        isNew: obj.isNew,
        isBestseller: obj.isBestseller,
        benefits: obj.benefits || [],
        howToUse: obj.howToUse || '',
        ingredients: obj.ingredients || [],
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

/**
 * Transforms an array of Mongoose documents into an array of DTOs.
 */
const productListDto = (docs) => docs.map(productDto);

module.exports = { productDto, productListDto };
