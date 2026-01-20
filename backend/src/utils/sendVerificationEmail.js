const { sendMail } = require("../config/nodemailer");

const sendVerificationEmail = async (user, areResending = false) => {
  const { email, username, emailVerificationToken } = user;

  if (!emailVerificationToken) {
    console.error("No verification token provided for sending it to user");
    throw new Error("No verification token found for user");
  }

  const verificationLink = `${process.env.BACKEND_URL}/auth/verify-email?token=${emailVerificationToken}`;

  const mailOptions = {
    from: `"DigiMart" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "✉ Verify Your Email Address",
    html: `
      <h2>Welcome to DigiMart, ${username}!</h2>
      <p>Thank you for signing up. Please verify your email to access your account.</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
        Verify Email
      </a>
      <p>If the button doesn't work: <a href="${verificationLink}">click here</a></p>
      <p><small>This link expires in 24 Hours.</small></p>
    `,
  };

  try {
    await sendMail(mailOptions);
    console.log(`📧 Verification email ${areResending === true ? "resent" : "sent"} to: ${email}`);
  } catch (error) {
    console.error(`📧 Failed to ${areResending === true ? "resend" : "send"} verification email to ${email}`, error.message);
    throw error;
  }
};

module.exports = sendVerificationEmail;