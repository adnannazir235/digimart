const mongoose = require("mongoose");

exports.connect = async function () {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB: Connected");
    } catch (error) {
        console.error("❌ MongoDB: Connection failed!");
        console.error(error.message || error);
        throw error;
    };
};