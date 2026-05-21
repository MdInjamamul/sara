/**
 * Output DTO for an Order.
 * Takes a raw Mongoose document and returns a clean, whitelisted object.
 */
const orderDto = (doc) => {
    if (!doc) return null;

    const obj = doc.toObject ? doc.toObject() : doc;

    return {
        _id: obj._id,
        user: obj.user,
        orderItems: (obj.orderItems || []).map(item => ({
            product: item.product,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity
        })),
        shippingAddress: obj.shippingAddress,
        paymentMethod: obj.paymentMethod,
        itemsPrice: obj.itemsPrice,
        shippingPrice: obj.shippingPrice,
        totalPrice: obj.totalPrice,
        orderStatus: obj.orderStatus,
        orderNote: obj.orderNote || '',
        cancelReason: obj.cancelReason || '',
        deliveredAt: obj.deliveredAt,
        cancelledAt: obj.cancelledAt,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

/**
 * Transforms an array of Mongoose documents into an array of DTOs.
 */
const orderListDto = (docs) => docs.map(orderDto);

module.exports = { orderDto, orderListDto };
