/**
 * Generates a professional HTML invoice email for SARA Herbal Company.
 * @param {Object} order - Populated order document
 * @returns {string} HTML string
 */
const generateInvoiceHTML = (order) => {
    const itemsRows = order.orderItems.map(item => `
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
                ${item.name}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right;">
                NPR ${item.price.toFixed(2)}
            </td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-weight: 600;">
                NPR ${(item.quantity * item.price).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    const orderId = order._id.toString().substring(order._id.toString().length - 8).toUpperCase();

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #2d5016 0%, #4a7c25 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">SARA</h1>
                <p style="color: #d4edda; margin: 8px 0 0; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Herbal Company</p>
            </div>

            <!-- Main Content -->
            <div style="background-color: #ffffff; padding: 32px; border: 1px solid #e2e8f0; border-top: none;">
                
                <!-- Success Banner -->
                <div style="text-align: center; margin-bottom: 32px;">
                    <div style="display: inline-block; width: 56px; height: 56px; background-color: #d1fae5; border-radius: 50%; line-height: 56px; font-size: 28px;">
                        ✓
                    </div>
                    <h2 style="margin: 16px 0 8px; color: #1e293b; font-size: 22px;">Order Confirmed!</h2>
                    <p style="color: #64748b; margin: 0; font-size: 14px;">Thank you for your order. We're preparing it for delivery.</p>
                </div>

                <!-- Order Info -->
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Order ID</td>
                            <td style="padding: 4px 0; text-align: right; font-weight: 600; font-size: 13px; font-family: monospace;">#${orderId}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Date</td>
                            <td style="padding: 4px 0; text-align: right; font-size: 13px;">${orderDate}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Payment</td>
                            <td style="padding: 4px 0; text-align: right; font-size: 13px;">${order.paymentMethod}</td>
                        </tr>
                        <tr>
                            <td style="padding: 4px 0; color: #64748b; font-size: 13px;">Status</td>
                            <td style="padding: 4px 0; text-align: right;">
                                <span style="background-color: #dbeafe; color: #1d4ed8; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">Confirmed</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Items Table -->
                <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 16px; font-weight: 600;">Order Items</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <thead>
                        <tr style="background-color: #f1f5f9;">
                            <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Product</th>
                            <th style="padding: 10px 16px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Qty</th>
                            <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Price</th>
                            <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsRows}
                    </tbody>
                </table>

                <!-- Totals -->
                <div style="border-top: 2px solid #e2e8f0; padding-top: 16px; margin-bottom: 24px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Subtotal</td>
                            <td style="padding: 6px 0; text-align: right; font-size: 14px;">NPR ${order.itemsPrice.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Shipping</td>
                            <td style="padding: 6px 0; text-align: right; font-size: 14px;">${order.shippingPrice > 0 ? 'NPR ' + order.shippingPrice.toFixed(2) : 'Free'}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px 0 0; font-size: 18px; font-weight: 700; color: #1e293b; border-top: 1px solid #e2e8f0;">Total</td>
                            <td style="padding: 12px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #2d5016; border-top: 1px solid #e2e8f0;">NPR ${order.totalPrice.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <!-- Shipping Address -->
                <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 12px; color: #1e293b; font-size: 14px; font-weight: 600; text-transform: uppercase;">Shipping Address</h3>
                    <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6;">
                        <strong>${order.shippingAddress.fullName}</strong><br>
                        ${order.shippingAddress.street}<br>
                        ${order.shippingAddress.city}, ${order.shippingAddress.state}${order.shippingAddress.zipCode ? ' ' + order.shippingAddress.zipCode : ''}<br>
                        ${order.shippingAddress.country}<br>
                        Phone: ${order.shippingAddress.phone}
                    </p>
                </div>

                ${order.orderNote ? `
                <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <h4 style="margin: 0 0 8px; color: #92400e; font-size: 13px; font-weight: 600;">Order Note</h4>
                    <p style="margin: 0; color: #78350f; font-size: 13px;">${order.orderNote}</p>
                </div>
                ` : ''}

                <!-- Estimated Delivery -->
                <div style="text-align: center; padding: 20px; background-color: #f0fdf4; border-radius: 8px;">
                    <p style="margin: 0; color: #166534; font-size: 14px; font-weight: 600;">
                        🚚 Estimated Delivery: 3-5 Business Days
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px; text-align: center; border-radius: 0 0 12px 12px; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-top: none;">
                <p style="margin: 0 0 8px; color: #64748b; font-size: 12px;">
                    This is an automated email from SARA Herbal Company. Please do not reply directly.
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                    © ${new Date().getFullYear()} SARA Herbal Company. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { generateInvoiceHTML };
