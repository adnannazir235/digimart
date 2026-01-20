const { sendMail } = require("../config/nodemailer");

exports.sendProductPurchasedEmail = async ({ to, orderUid, productTitles, downloadUrl, amount, currencyCode }) => {
    try {
        const productTitlesHtml = productTitles.map((title, index) => `<p><strong>Product ${index + 1}:</strong> ${title}</p>`).join("");

        const mailOptions = {
            from: `"DigiMart" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Your DigiMart Order #${orderUid} - Download Instructions`,
            html: `
                <h2>Thank You for Your Purchase!</h2>
                <p>Your order <strong>#${orderUid}</strong> has been successfully processed.</p>

                ${productTitlesHtml}

                <p><strong>Amount:</strong> ${amount / 100} ${currencyCode}</p>

                <p>You can download your ${productTitles.length === 1 ? "product" : "products"} using the link below:</p>
                <p>
                    <a href="${downloadUrl}"
                       style="background-color: dodgerblue; color: white; padding: 10px 20px;
                              text-decoration: none; border-radius: 5px;">
                        Download Now
                    </a>
                </p>

                <p><strong>Note:</strong> This download link will expire in 24 Hours for security reasons.</p>
                <p>This link is valid for authorized users only. If you have issues, contact support.</p>
                <p>Thank you for shopping with DigiMart!</p>
            `
        };

        await sendMail(mailOptions);
        console.log(`Email sent to ${to} for order ${orderUid}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw new Error("Email sending failed");
    }
};