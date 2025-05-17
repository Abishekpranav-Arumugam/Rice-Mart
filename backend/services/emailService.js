// backend/services/emailService.js
const nodemailer = require('nodemailer'); // Uncomment if you set up nodemailer

const sendLowStockNotification = async (productName, availableQuantity, adminEmail) => {
  console.info(`INFO: Attempting to send low stock email notification for ${productName}.`);

  if (!adminEmail) {
    console.warn(`WARN: ADMIN_EMAIL not configured in .env file. Cannot send low stock notification for ${productName}.`);
    return;
  }

  if (!productName || typeof availableQuantity === 'undefined') {
    console.error('ERROR: Missing product name or quantity for low stock notification.');
    return;
  }

  const subject = `Low Stock Alert: ${productName}`;
  const bodyText = `Dear Admin,\n\nThe stock for "${productName}" is running low.\n\nCurrent available quantity: ${availableQuantity} kg.\n\nPlease restock soon.\n\nRegards,\nRice Mart System`;
  const bodyHtml = `
    <p>Dear Admin,</p>
    <p>The stock for <strong>${productName}</strong> is running low.</p>
    <p>Current available quantity: <strong>${availableQuantity} kg</strong>.</p>
    <p>Please restock soon.</p>
    <p>Regards,<br/>Rice Mart System</p>
  `;

  // --- Check for Email Service Configuration ---
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM_ADDRESS) {
    console.warn("WARN: Email service credentials (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM_ADDRESS) not fully configured in .env. Will simulate email only.");
    // Simulate if not configured
    console.log(`--- EMAIL SIMULATION (due to missing config) ---
      To: ${adminEmail}
      Subject: ${subject}
      Body (Text): ${bodyText}
    --- END EMAIL SIMULATION ---`);
    return;
  }

  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465', // true for 465 (SSL), false for others (TLS on 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // For development with self-signed certs, you might need this (not recommended for production)
      // tls: {
      //   rejectUnauthorized: false
      // }
    });

    let mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS, // sender address
      to: adminEmail, // list of receivers
      subject: subject, // Subject line
      text: bodyText, // plain text body
      html: bodyHtml, // html body
    };

    console.log(`Attempting to send actual email via Nodemailer to ${adminEmail} from ${process.env.EMAIL_FROM_ADDRESS} using host ${process.env.EMAIL_HOST}`);
    let info = await transporter.sendMail(mailOptions);
    console.log(`Low stock notification email sent for ${productName} to ${adminEmail}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`ERROR sending low stock email for ${productName} via Nodemailer:`, error.message);
    console.error("Nodemailer error details:", error);
    // You could potentially add a retry mechanism here or log to a more persistent error tracking service.
  }
};

module.exports = { sendLowStockNotification };