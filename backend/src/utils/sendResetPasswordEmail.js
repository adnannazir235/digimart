const { sendMail } = require("../config/emailProvider");

const sendResetPasswordEmail = async (user) => {
    const { email, username, resetPasswordToken } = user;
    const resetUrl = `${process.env.FRONTEND_URL}/${(process.env.REACT_FRONTEND_URL_BASE_NAME !== undefined ? process.env.REACT_FRONTEND_URL_BASE_NAME + "/" : "")}reset-password?token=${encodeURIComponent(resetPasswordToken)}`;

    const mailOptions = {
        from: `"DigiMart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "🔒 DigiMart Password Reset Request",
        html: `
            <h2>Hello ${username},</h2>
            <p>You requested to reset your DigiMart password. Click the link below to reset it:</p>
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
            <p>If the button above doesn't work, copy and paste this URL into your browser: <br>${resetUrl}</p>
            <p><small>This link expires in 15 minutes. If you didn't request this, please ignore this email or reply to this email.</small></p>
        `
    };

    try {
        await sendMail(mailOptions);
        console.log(`📧 Reset password email sent to: ${email}`);
    } catch (error) {
        console.error(`📧 Failed to send reset password email to ${email}`, error.message);
        throw error;
    }
};

module.exports = { sendResetPasswordEmail };