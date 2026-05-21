/**
 * Output DTO for User management.
 */

const userDto = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;

    return {
        _id: obj._id,
        name: obj.name,
        email: obj.email,
        phone: obj.phone || '',
        location: obj.location || '',
        photo: obj.photo || '',
        role: obj.role,
        createdAt: obj.createdAt,
        updatedAt: obj.updatedAt
    };
};

const userListDto = (docs) => docs.map(userDto);

const userDetailDto = (user, orderStats) => ({
    ...userDto(user),
    orderStats: {
        totalOrders: orderStats.totalOrders || 0,
        totalSpent: orderStats.totalSpent || 0
    }
});

module.exports = { userDto, userListDto, userDetailDto };
