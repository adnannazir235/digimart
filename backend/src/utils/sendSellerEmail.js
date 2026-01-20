const { sendMail } = require("../config/nodemailer");

const sendSellerOnboardingEmail = async (user) => {
    const { email, username, role, isSeller } = user;

    // Only send this email when user becomes a seller
    if (!isSeller || role !== "seller") return;

    const mailOptions = {
        from: `"DigiMart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "✅ You’re Now a Seller on DigiMart!",
        html: `
            <h2>Hi ${username},</h2>
            <p>Your account has been successfully upgraded to <strong>Seller</strong> on DigiMart.</p>
            
            <p>As an existing buyer, you already know how DigiMart works — now you can sell too!</p>
            
            <p>⚠️ <strong>Next step:</strong> To start listing and selling digital products, you must connect your Stripe account for secure payouts.</p>
            
            <p>Once connected, you’ll be able to:</p>
            <ul>
                <li>Upload and publish your digital products</li>
                <li>Receive payments directly to your bank</li>
                <li>Manage your shop from your seller dashboard</li>
            </ul>
            
            <p>You’ll receive a confirmation email once your Stripe account is linked.</p>
            
            <p>Happy selling!<br>— DigiMart</p>
        `
    };

    try {
        await sendMail(mailOptions);
        console.log(`📧 Seller onboarding email sent to: ${email}`);
    } catch (error) {
        console.error(`📧 Failed to send seller onboarding email to ${email}: ${error.message}`);
        throw error;
    }
};

const sendStripeConnectedEmail = async (user) => {
    const { email, username } = user;

    const mailOptions = {
        from: `"DigiMart" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "✅ Your Stripe Account Is Now Connected!",
        html: `
            <h2>Hi ${username},</h2>
            <p>Your Stripe account has been successfully linked to your DigiMart shop.</p>
            
            <p>✅ <strong>You’re now ready to sell!</strong></p>
            
            <p>Start listing your first product today!</p>
            
            <p>— DigiMart</p>
        `
    };

    try {
        await sendMail(mailOptions);
        console.log(`📧 Stripe connected email sent to: ${email}`);
    } catch (error) {
        console.error(`📧 Failed to send Stripe connected email to ${email}: ${error.message}`);
        throw error;
    }
};

module.exports = { sendSellerOnboardingEmail, sendStripeConnectedEmail };