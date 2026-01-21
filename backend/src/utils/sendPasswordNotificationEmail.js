const { sendMail } = require("../config/nodemailer");

const sendPasswordNotificationEmail = async (user, action = "set") => {
  const actionVerb = action === "set" ? "set" : action === "reset" ? "reset" : "changed";

  const mailOptions = {
    from: `"DigiMart" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `🔒 Your DigiMart Password Has Been ${actionVerb.charAt(0).toUpperCase() + actionVerb.slice(1)}`,
    html: `
      <h2>Hello ${user.username},</h2>
      <p>Your password has been ${actionVerb}. 
      ${action === "set"
        ? "You can now log in manually using your email or username."
        : action === "reset"
          ? "Please log in with your new password."
          : "Your account password has been updated."
      }
      If you did not initiate this action, please reply to this email immediately.</p>
    `,
  };

  try {
    await sendMail(mailOptions);
    console.log(`📧 Password ${actionVerb} notification email sent to: ${user.email}`);
  } catch (error) {
    console.error(`📧 Failed to send password ${actionVerb} notification email to ${user.email}: ${error.message}`);
    throw error;
  }
};

module.exports = sendPasswordNotificationEmail;