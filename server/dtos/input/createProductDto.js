/**
 * Input DTO for creating a product.
 * Maps the validated req.body into a strict contract object
 * that the Service layer will receive.
 */
const createProductDto = (body) => ({
    name: body.name,
    slug: body.slug,
    description: body.description,
    shortDescription: body.shortDescription,
    price: body.price,
    discountPrice: body.discountPrice || null,
    categorySlug: body.categorySlug,
    images: body.images || [],
    isNew: body.isNew || false,
    stock: body.stock || 0,
    benefits: body.benefits || [],
    howToUse: body.howToUse || '',
    ingredients: body.ingredients || [],
    variants: body.variants || []
});

module.exports = createProductDto;
