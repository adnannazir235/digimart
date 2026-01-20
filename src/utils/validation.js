const bcrypt = require("bcrypt");
const { user: userConfig, shop: shopConfig, product: productConfig } = require("../config/validation");

const SALT_ROUNDS = 12;

exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

exports.verifyPassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

exports.userNameChecks = (username) => {
    if (!username) return { message: "Username is required." }
    if (username.length < userConfig.minUserNameLength) return { message: `Username must be at least ${userConfig.minUserNameLength} characters long.` }
    if (username.length > userConfig.maxUserNameLength) return { message: `Username must not exceed ${userConfig.maxUserNameLength} characters.` }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return { message: "Username can only contain letters, numbers, and underscores." }
    return false;
};

exports.emailChecks = (email) => {
    if (!email) return { message: "Email is required." }
    if (email.length < userConfig.minEmailLength) return { message: `Email must be at least ${userConfig.minEmailLength} characters long.` }
    if (email.length > userConfig.maxEmailLength) return { message: `Email must not exceed ${userConfig.maxEmailLength} characters.` }
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email)) return { message: "Please provide a valid email address." }
    return false;
};

exports.nameChecks = (name) => {
    if (!name) return { message: "Name is required." }
    if (typeof name !== "string") return { message: "Name must be a string." }
    if (name.trim().length === 0) return { message: "Name cannot be empty or just whitespace." }
    if (name.length < userConfig.minNameLength) return { message: `Name must be at least ${userConfig.minNameLength} character long.` }
    if (name.length > userConfig.maxNameLength) return { message: `Name must not exceed ${userConfig.maxNameLength} characters.` }
    return false;
};

exports.avatarChecks = (avatar) => {
    if (!avatar) return { message: "Avatar is required." }
    if (typeof avatar !== "string") return { message: "Avatar must be a string." }
    if (avatar.trim().length === 0) return { message: "Avatar URL cannot be empty or just whitespace." }
    if (!/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(avatar)) return { message: "Avatar must be a valid URL." }
    if (avatar.length > userConfig.maxUserAvatarLength) return { message: `Avatar URL must not exceed ${userConfig.maxUserAvatarLength} characters.` }
    return false;
};

exports.bioChecks = (bio) => {
    if (!bio) return { message: "Bio is required." }
    if (typeof bio !== "string") return { message: "Bio must be a string." }
    if (bio.length > userConfig.maxUserBioLength) return { message: `Bio must not exceed ${userConfig.maxUserBioLength} characters.` }
    return false;
};

exports.shopNameChecks = (shopName) => {
    if (!shopName) return { message: "Shop name is required." }
    if (typeof shopName !== "string") return { message: "Shop name must be a string." }
    if (shopName.trim().length === 0) return { message: "Shop name cannot be empty or just whitespace." }
    if (shopName.length < shopConfig.minShopNameLength) return { message: `Shop name must be at least ${shopConfig.minShopNameLength} characters long.` }
    if (shopName.length > shopConfig.maxShopNameLength) return { message: `Shop name must not exceed ${shopConfig.maxShopNameLength} characters.` }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(shopName)) return { message: "Shop name can only contain letters, numbers, spaces, underscores, and hyphens." }
    return false;
};

exports.shopDescriptionChecks = (description) => {
    if (!description) return { message: "Shop description is required." }
    if (typeof description !== "string") return { message: "Shop description must be a string." }
    if (description.trim().length === 0) return { message: "Shop description cannot be empty or just whitespace." }
    if (description.length > shopConfig.maxSellerProfileDescriptionLength) return { message: `Shop description must not exceed ${shopConfig.maxSellerProfileDescriptionLength} characters.` }
    return false;
};

exports.shopLogoChecks = (logo) => {
    if (!logo) return { message: "Shop logo is required." }
    if (typeof logo !== "string") return { message: "Shop logo must be a string." }
    if (logo.trim().length === 0) return { message: "Shop logo URL cannot be empty or just whitespace." }
    if (!/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(logo)) return { message: "Shop logo must be a valid URL." }
    if (logo.length > shopConfig.maxSellerLogoLength) return { message: `Shop logo URL must not exceed ${shopConfig.maxSellerLogoLength} characters.` }
    return false;
};

exports.ageChecks = (age) => {
    if (!age) return { message: "Age is required." }
    if (typeof age !== "number" || isNaN(age)) return { message: "Age must be a number." }
    if (!Number.isInteger(age)) return { message: "Age must be a whole number." }
    if (age < userConfig.minUserAge) return { message: `Age must be at least ${userConfig.minUserAge}.` }
    if (age > userConfig.maxUserAge) return { message: `Age must not exceed ${userConfig.maxUserAge}.` }
    return false;
};

exports.passChecks = (password) => {
    if (!password) return { message: "Password is required." }
    if (password.length < userConfig.minPassLength) return { message: `Password must be at least ${userConfig.minPassLength} characters long.` }
    if (password.length > userConfig.maxPassLength) return { message: `Password must not exceed ${userConfig.maxPassLength} characters.` }
    return false;
};

exports.confirmPassChecks = (password, confirmPassword) => {
    if (!password) console.error("Password Missing in the confirmPassChecks.")
    if (!confirmPassword) return { message: "Confirm Password is required." }
    if (password !== confirmPassword) return { message: "Password and Confirm Password do not match!" }
    return false;
};

exports.productTitleChecks = (title) => {
    if (!title) return { message: "Product title is required." }
    if (typeof title !== "string") return { message: "Product title must be a string." }
    if (title.trim().length === 0) return { message: "Product title cannot be empty or just whitespace." }
    if (title.length < productConfig.minTitleLength) return { message: `Product title must be at least ${productConfig.minTitleLength} characters long.` }
    if (title.length > productConfig.maxTitleLength) return { message: `Product title must not exceed ${productConfig.maxTitleLength} characters.` }
    if (!/^[a-zA-Z0-9\s_-]+$/.test(title)) return { message: "Product title can only contain letters, numbers, spaces, underscores, and hyphens." }
    return false;
};

exports.productDescriptionChecks = (description) => {
    if (!description) return { message: "Product description is required." }
    if (typeof description !== "string") return { message: "Product description must be a string." }
    if (description.trim().length === 0) return { message: "Product description cannot be empty or just whitespace." }
    if (description.length < productConfig.minDescriptionLength) return { message: `Product description must be at least ${productConfig.minDescriptionLength} characters long.` }
    if (description.length > productConfig.maxDescriptionLength) return { message: `Product description must not exceed ${productConfig.maxDescriptionLength} characters.` }
    return false;
};

exports.countryChecks = (countryName) => {
    if (!countryName) return { message: "Country is required." };
    if (typeof countryName !== "string") return { message: "Country must be a string." }
    if (countryName.trim().length === 0) return { message: "Country cannot be empty or just whitespace." }

    const allowed = userConfig.allowedCountries.find(c => c.name === countryName);
    if (!allowed) return { message: "Selected country is not supported." };
    return false;
};