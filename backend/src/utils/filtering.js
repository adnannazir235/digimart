exports.sanitizeUser = function (user) {
    if (!user) return null;
    const { _id, resetPasswordToken, passwordToken, refreshTokenHash, refreshTokenSelector, refreshTokenExpiry, lastAccessToken, isDeleted, googleId, googleTokens, emailVerificationToken, isEmailVerified, id, password, __v, ...safeUser } = user.toObject();
    safeUser.isPassSet = !!user.password;
    safeUser.isGoogleSet = !!user.googleId;
    return safeUser;
};

exports.sanitizeShop = function (shop) {
    if (!shop) return null;
    const { isDeleted, stripeAccountId, sellerIdsellerId, id, __v, ...safeShop } = shop.toObject();
    return safeShop;
};

exports.sanitizeProduct = function (product) {
    if (!product) return null;
    const { isDeleted, cloudinaryPublicId, cloudinarySecureUrl, watermarkedPublicId, watermarkedFileUrl, __v, ...safeProduct } = product.toObject();
    return safeProduct;
};

exports.sanitizeOrder = function (order) {
    if (!order) return null;
    const { createdAt, currencyCode, platformFee, stripeSessionId, __v, ...safeOrder } = order.toObject();
    return safeOrder;
};