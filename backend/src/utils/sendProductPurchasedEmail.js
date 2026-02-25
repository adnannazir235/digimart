const { sendMail } = require("../config/emailProvider");

exports.sendProductPurchasedEmail = async ({ to, orderUid, products, amount, currencyCode }) => {
    const platformFeePercent = Number(process.env.PLATFORM_FEE_PERCENT || 0);

    try {
        // total paid from Stripe, already in cents → convert to dollars
        const totalPaid = (amount / 100).toFixed(2);

        // Sum product prices (products.price is in cents) → convert to dollars
        const amountSum = products.reduce((sum, p) => sum + p.price, 0); // sum in cents
        const amountFormatted = (amountSum / 100).toFixed(2); // convert to dollars

        // Platform fee based on product sum
        const feeAmount = ((amountSum / 100) * (platformFeePercent / 100)).toFixed(2);

        // Keep product rows EXACTLY as before
        const productListHtml = products
            .map((p, index) => {
                const priceFormatted = (p.price / 100).toFixed(2); // convert cents → dollars
                return `<p>Product ${index + 1}: ${p.title} - ${priceFormatted} ${currencyCode}</p>`;
            })
            .join("");

        const mailOptions = {
            from: `"DigiMart" <${process.env.EMAIL_USER}>`,
            to,
            subject: `Order Confirmation #${orderUid} - DigiMart`,
            html: `
        <h2>Thank You for Your Purchase!</h2>
        <p>Your order <strong>#${orderUid}</strong> has been successfully processed.</p>

        <h3>Order Summary</h3>
        ${productListHtml}

        <p><strong>Amount:</strong> ${amountFormatted} ${currencyCode}</p>
        <p><strong>Platform Fee:</strong> ${platformFeePercent}% (${feeAmount} ${currencyCode})</p>
        <p><strong>Total Paid:</strong> ${totalPaid} ${currencyCode}</p>

        <p>You can now download your product(s) from your dashboard.</p>

        <p>Thank you for shopping with DigiMart!</p>
      `,
        };

        await sendMail(mailOptions);
        console.log(`Email sent to ${to} for order ${orderUid}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error.message);
        throw new Error("Email sending failed");
    }
};