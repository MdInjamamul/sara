/**
 * Input DTO for updating a product.
 * Only includes fields that were actually provided in the request.
 * The Service layer uses this to do a partial update.
 */
const updateProductDto = (body) => {
    const dto = {};

    if (body.name !== undefined) dto.name = body.name;
    if (body.slug !== undefined) dto.slug = body.slug;
    if (body.description !== undefined) dto.description = body.description;
    if (body.shortDescription !== undefined) dto.shortDescription = body.shortDescription;
    if (body.price !== undefined) dto.price = body.price;
    if (body.discountPrice !== undefined) dto.discountPrice = body.discountPrice;
    if (body.categorySlug !== undefined) dto.categorySlug = body.categorySlug;
    if (body.image !== undefined) dto.image = body.image;
    if (body.isNew !== undefined) dto.isNew = body.isNew;
    if (body.stock !== undefined) dto.stock = body.stock;
    if (body.benefits !== undefined) dto.benefits = body.benefits;
    if (body.howToUse !== undefined) dto.howToUse = body.howToUse;
    if (body.ingredients !== undefined) dto.ingredients = body.ingredients;

    return dto;
};

module.exports = updateProductDto;
