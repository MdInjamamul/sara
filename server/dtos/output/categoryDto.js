/**
 * Output DTO for a Category.
 * Takes a raw Mongoose document and returns a clean, whitelisted object.
 */
const categoryDto = (doc) => {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : doc;

    return {
        _id: obj._id,
        name: obj.name,
        slug: obj.slug,
        description: obj.description,
        image: obj.image,
        productCount: obj.productCount,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

/**
 * Transforms an array of Mongoose documents into an array of DTOs.
 */
const categoryListDto = (docs) => docs.map(categoryDto);

module.exports = { categoryDto, categoryListDto };
