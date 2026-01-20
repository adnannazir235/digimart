const limitations = {
    user: {
        minUserAge: 18,
        maxUserAge: 100,

        minPassLength: 8,
        maxPassLength: 128,

        minUserNameLength: 5,
        maxUserNameLength: 30,

        minNameLength: 4,
        maxNameLength: 50,

        minEmailLength: 6,
        maxEmailLength: 254,

        maxUserBioLength: 500,
        maxUserAvatarLength: 1100,

        allowedCountries: [
            { name: "Pakistan", countryCode: "PK", currencySymbol: "Rs", currencyCode: "PKR" },
            { name: "United States", countryCode: "US", currencySymbol: "$", currencyCode: "USD" }
        ]
    },
    shop: {
        minShopNameLength: 3,
        maxShopNameLength: 50,
        maxSellerProfileDescriptionLength: 1000,
        maxSellerLogoLength: 500
    },
    product: {
        minTitleLength: 3,
        maxTitleLength: 100,
        minDescriptionLength: 10,
        maxDescriptionLength: 2000
    }
};

module.exports = limitations;