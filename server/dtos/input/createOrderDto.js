/**
 * Input DTO for creating an order.
 * Maps the validated req.body into a strict contract object
 * that the Service layer will receive.
 * 
 * NOTE: Cart items and prices are NOT accepted from the client.
 * The Service reads them from the user's cart in the database
 * to prevent price tampering.
 */
const createOrderDto = (body) => ({
    shippingAddress: {
        fullName: body.shippingAddress.fullName,
        phone: body.shippingAddress.phone,
        street: body.shippingAddress.street,
        city: body.shippingAddress.city,
        state: body.shippingAddress.state,
        zipCode: body.shippingAddress.zipCode || '',
        country: body.shippingAddress.country || 'Nepal'
    },
    orderNote: body.orderNote || ''
});

module.exports = createOrderDto;
