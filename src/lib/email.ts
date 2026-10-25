import tls from "tls";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Direct Zero-Dependency TLS SMTP Email Sender for Gmail
 * Connects securely to smtp.gmail.com on port 465 with native Node.js TLS
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const user = process.env.ADMIN_EMAIL || "playoedappal99@gmail.com";
  const rawPass = process.env.ADMIN_EMAIL_PASS || "ahtf fjtn uivp jgsn";
  const pass = rawPass.replace(/\s+/g, ""); // Strip whitespace for Google App Passwords

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: "smtp.gmail.com",
        port: 465,
        timeout: 15000,
      },
      () => {
        // Connected securely
      }
    );

    let stage = 0;

    const sendCmd = (cmd: string) => {
      socket.write(cmd + "\r\n");
    };

    socket.setEncoding("utf8");

    socket.on("data", (data: string) => {
      const lines = data.trim().split("\n");
      const lastLine = lines[lines.length - 1];

      // Initial 220 banner
      if (stage === 0 && lastLine.startsWith("220")) {
        stage = 1;
        sendCmd(`EHLO playoedappal.in`);
        return;
      }

      // 250 after EHLO
      if (stage === 1 && lastLine.startsWith("250")) {
        stage = 2;
        sendCmd("AUTH LOGIN");
        return;
      }

      // 334 Username challenge
      if (stage === 2 && lastLine.startsWith("334")) {
        stage = 3;
        sendCmd(Buffer.from(user).toString("base64"));
        return;
      }

      // 334 Password challenge
      if (stage === 3 && lastLine.startsWith("334")) {
        stage = 4;
        sendCmd(Buffer.from(pass).toString("base64"));
        return;
      }

      // 235 Auth succeeded
      if (stage === 4 && lastLine.startsWith("235")) {
        stage = 5;
        sendCmd(`MAIL FROM:<${user}>`);
        return;
      }

      // 250 Sender OK
      if (stage === 5 && lastLine.startsWith("250")) {
        stage = 6;
        sendCmd(`RCPT TO:<${to}>`);
        return;
      }

      // 250 Recipient OK
      if (stage === 6 && lastLine.startsWith("250")) {
        stage = 7;
        sendCmd("DATA");
        return;
      }

      // 354 Send mail body
      if (stage === 7 && lastLine.startsWith("354")) {
        stage = 8;
        const boundary = `====playo_${Date.now()}_boundary====`;
        const headers = [
          `From: "Playo Edappal Security" <${user}>`,
          `To: <${to}>`,
          `Subject: ${subject}`,
          `MIME-Version: 1.0`,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          `Date: ${new Date().toUTCString()}`,
          `Message-ID: <${Date.now()}@playoedappal.in>`,
          "",
          `--${boundary}`,
          `Content-Type: text/plain; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          "",
          text || "Playo Edappal OTP verification code.",
          "",
          `--${boundary}`,
          `Content-Type: text/html; charset=UTF-8`,
          `Content-Transfer-Encoding: 7bit`,
          "",
          html,
          "",
          `--${boundary}--`,
          ".",
        ].join("\r\n");

        sendCmd(headers);
        return;
      }

      // 250 Mail queued/sent OK
      if (stage === 8 && lastLine.startsWith("250")) {
        stage = 9;
        sendCmd("QUIT");
        socket.end();
        resolve({ success: true, messageId: lastLine });
        return;
      }

      // Error code (4xx or 5xx)
      if (lastLine.startsWith("4") || lastLine.startsWith("5")) {
        socket.destroy();
        resolve({
          success: false,
          error: `SMTP Error at stage ${stage}: ${lastLine}`,
        });
      }
    });

    socket.on("error", (err) => {
      resolve({ success: false, error: err.message });
    });

    socket.on("timeout", () => {
      socket.destroy();
      resolve({ success: false, error: "Connection to Gmail SMTP timed out." });
    });
  });
}

/**
 * Generate a luxury HTML email for Playo Admin OTP verification
 */
export function generateOtpEmailHtml(otp: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playo Edappal - Admin Password Reset</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d1b2a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d1b2a; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #16283c; border-radius: 24px; border: 1px solid rgba(255, 152, 0, 0.25); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
          <!-- Header with Amber Accent -->
          <tr>
            <td align="center" style="padding: 36px 30px 24px; background: linear-gradient(180deg, rgba(255, 152, 0, 0.15) 0%, rgba(22, 40, 60, 0) 100%);">
              <div style="display: inline-block; padding: 10px 18px; border-radius: 9999px; background: rgba(255, 152, 0, 0.15); border: 1px solid #FF9800; color: #FF9800; font-size: 13px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">
                🔒 ADMIN SECURITY VERIFICATION
              </div>
              <h1 style="margin: 18px 0 6px; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Playo Edappal Toy Showroom
              </h1>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                One-Time Password (OTP) for Admin Password Reset
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td align="center" style="padding: 10px 30px 24px;">
              <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 20px; line-height: 1.5;">
                We received a request to reset the administrator password for <strong>playoedappal@admin</strong>. Use the secure 6-digit code below to proceed:
              </p>
              
              <div style="background-color: #0d1b2a; border: 2px dashed #FF9800; border-radius: 18px; padding: 22px 30px; display: inline-block; margin: 10px 0;">
                <span style="font-size: 38px; font-weight: 900; letter-spacing: 12px; color: #FF9800; font-family: 'Courier New', Courier, monospace;">
                  ${otp}
                </span>
              </div>

              <p style="margin: 20px 0 0; font-size: 12px; color: #f59e0b; font-weight: 600;">
                ⏱️ This code expires in 10 minutes.
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 20px 30px 36px; border-top: 1px solid rgba(255, 255, 255, 0.08); background-color: rgba(13, 27, 42, 0.6);">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-size: 11px; color: #64748b; line-height: 1.6;">
                    <strong>Security Alert:</strong> If you did not initiate this password reset, your administrator credentials may be at risk. No actions have been applied yet. Do not share this code with anyone.
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 20px; font-size: 10px; color: #475569;">
                    © 2026 Playo Edappal Showroom, Edappal, Malappuram, Kerala. All rights reserved.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Generate an executive HTML order receipt for Playo Edappal Admin
 */
export function generateOrderEmailHtml(order: {
  id: string;
  orderDate?: string;
  customerName: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  shippingOption?: string;
  deliveryInstructions?: string;
  status?: string;
  courier?: string;
  trackingNumber?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  items: Array<{
    id?: string;
    name: string;
    imageUrl?: string;
    price: number;
    deliveryFee?: number;
    quantity: number;
    specs?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}): string {
  const itemsRows = (order.items || [])
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          <strong>${item.name}</strong>
          ${item.specs ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${item.specs}</div>` : ""}
        </td>
        <td align="center" style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b; font-weight: 600;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
          ₹${Number(item.price).toLocaleString("en-IN")}
        </td>
        <td align="right" style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #0284c7; font-weight: 700;">
          ₹${(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
        </td>
      </tr>
    `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Order #${order.id} - Playo Edappal</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
          <!-- Top Accent Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #FF9800 0%, #EA580C 100%); padding: 26px 30px; text-align: center;">
              <div style="display: inline-block; padding: 6px 14px; border-radius: 9999px; background: rgba(255, 255, 255, 0.25); color: #ffffff; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
                🛒 NEW ORDER NOTIFICATION
              </div>
              <h1 style="margin: 12px 0 4px; font-size: 26px; font-weight: 900; color: #ffffff;">
                Playo Edappal Toy Showroom
              </h1>
              <p style="margin: 0; font-size: 13px; color: #ffedd5; font-weight: 500;">
                Near Nesto Hypermarket, Edappal, Malappuram, Kerala
              </p>
            </td>
          </tr>

          <!-- Order Summary Card -->
          <tr>
            <td style="padding: 24px 30px 10px;">
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">ORDER NUMBER</div>
                      <div style="font-size: 20px; font-weight: 900; color: #0284c7; margin-top: 2px;">#${order.id}</div>
                    </td>
                    <td align="right">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 700;">AMOUNT PAID</div>
                      <div style="font-size: 22px; font-weight: 900; color: #16a34a; margin-top: 2px;">₹${Number(order.total).toLocaleString("en-IN")}</div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 10px; font-size: 12px; color: #64748b;">
                      <strong>Date:</strong> ${order.orderDate || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} &nbsp;|&nbsp; 
                      <strong>Payment:</strong> <span style="color: #16a34a; font-weight: 700;">${order.paymentStatus || "PAID"}</span> via ${order.paymentMethod || "Razorpay"}
                    </td>
                  </tr>
                  ${order.razorpayPaymentId ? `
                  <tr>
                    <td colspan="2" style="padding-top: 4px; font-size: 11px; color: #64748b; font-family: monospace;">
                      <strong>Razorpay Payment ID:</strong> ${order.razorpayPaymentId}
                    </td>
                  </tr>` : ""}
                </table>
              </div>
            </td>
          </tr>

          <!-- Customer & Delivery Details -->
          <tr>
            <td style="padding: 16px 30px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #334155;">Customer & Delivery Details</h3>
              <div style="background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px 18px; line-height: 1.6; font-size: 14px;">
                <div style="font-weight: 700; color: #0f172a; font-size: 16px;">${order.customerName}</div>
                <div style="color: #0284c7; font-weight: 600; margin: 4px 0;">
                  📞 <a href="tel:${order.phone}" style="color: #0284c7; text-decoration: none;">+91 ${order.phone}</a>
                  ${order.email ? ` &nbsp;•&nbsp; ✉️ <a href="mailto:${order.email}" style="color: #0284c7; text-decoration: none;">${order.email}</a>` : ""}
                </div>
                <div style="color: #334155; margin-top: 8px;">
                  📍 <strong>Delivery Address:</strong><br />
                  ${order.deliveryAddress.replace(/\n/g, "<br />")}
                </div>
                ${order.deliveryInstructions ? `
                <div style="margin-top: 8px; font-size: 13px; color: #d97706; background-color: #fef3c7; padding: 8px 12px; border-radius: 8px;">
                  <strong>Note:</strong> ${order.deliveryInstructions}
                </div>` : ""}
                <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                  <strong>Courier:</strong> ${order.courier || order.shippingOption || "Indian Post Door-to-Door Delivery"} &nbsp;|&nbsp; 
                  <strong>Tracking ID:</strong> <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${order.trackingNumber || "Pending"}</span>
                </div>
              </div>
            </td>
          </tr>

          <!-- Items Ordered Table -->
          <tr>
            <td style="padding: 10px 30px 20px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.8px; color: #334155;">Items Ordered (${order.items?.length || 0})</h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8fafc;">
                    <th align="left" style="padding: 10px 14px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Item</th>
                    <th align="center" style="padding: 10px 14px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Qty</th>
                    <th align="right" style="padding: 10px 14px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Unit Price</th>
                    <th align="right" style="padding: 10px 14px; font-size: 12px; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Bill Breakdown -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 14px; font-size: 14px; color: #475569;">
                <tr>
                  <td align="right" style="padding: 4px 10px;">Subtotal:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-weight: 600; color: #0f172a;">₹${Number(order.subtotal).toLocaleString("en-IN")}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr>
                  <td align="right" style="padding: 4px 10px; color: #16a34a;">Special Offer Discount:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-weight: 600; color: #16a34a;">-₹${Number(order.discount).toLocaleString("en-IN")}</td>
                </tr>` : ""}
                <tr>
                  <td align="right" style="padding: 4px 10px;">Delivery Fee:</td>
                  <td align="right" width="100" style="padding: 4px 0; font-weight: 600; color: #0f172a;">${order.deliveryFee > 0 ? `₹${Number(order.deliveryFee).toLocaleString("en-IN")}` : "FREE"}</td>
                </tr>
                <tr style="border-top: 2px solid #0f172a;">
                  <td align="right" style="padding: 10px 10px 4px; font-size: 16px; font-weight: 900; color: #0f172a;">Grand Total:</td>
                  <td align="right" width="100" style="padding: 10px 0 4px; font-size: 18px; font-weight: 900; color: #16a34a;">₹${Number(order.total).toLocaleString("en-IN")}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Admin Dashboard Button -->
          <tr>
            <td align="center" style="padding: 10px 30px 30px;">
              <a href="https://playoedappal.in/admin" style="display: inline-block; background: linear-gradient(135deg, #FF9800 0%, #EA580C 100%); color: #ffffff; font-weight: 800; font-size: 14px; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35);">
                Open Admin Dashboard & Dispatch Order →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.6;">
              This is an automated notification from <strong>Playo Edappal Toy Showroom</strong>.<br />
              Location: Near Nesto Hypermarket, Edappal, Malappuram, Kerala - 679576.<br />
              © 2026 Playo Edappal. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
