const nodemailerProvider = require("./nodemailer");
const zohoProvider = require("./zohoMail");

const activeProvider = process.env.NODE_ENV === "production"
    ? zohoProvider
    : nodemailerProvider;

const verifyConnection = async () => {
    return activeProvider.verifyConnection();
};

const sendMail = async (options) => {
    return activeProvider.sendMail(options);
};

module.exports = { sendMail, verifyConnection };