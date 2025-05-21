// backend/services/emailService.js
const nodemailer = require('nodemailer');

const sendLowStockNotification = async (productName, availableQuantity, adminEmail) => {
  console.log(`--- emailService: Received request for ${productName} (Qty: ${availableQuantity}) to ${adminEmail} ---`);

  if (!adminEmail) {
    console.error(`emailService ERROR: ADMIN_EMAIL is not configured. Cannot send notification for ${productName}.`);
    return; // Must return here to stop processing
  }

  if (!productName || typeof availableQuantity === 'undefined') {
    console.error(`emailService ERROR: Missing product name or quantity. Product: ${productName}, Qty: ${availableQuantity}.`);
    return; // Must return
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

  const envVars = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    passDefined: !!process.env.EMAIL_PASS, // Only check if defined, don't log the pass itself
    from: process.env.EMAIL_FROM_ADDRESS,
  };
  console.log("emailService: Environment Variables Check:", envVars);

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM_ADDRESS) {
    console.warn("emailService WARN: One or more email service credentials (HOST, PORT, USER, PASS, FROM_ADDRESS) are NOT configured. Simulating email ONLY.");
    console.log(`--- EMAIL SIMULATION (due to missing/incomplete config) ---
      To: ${adminEmail}
      Subject: ${subject}
      Body (Text): ${bodyText.substring(0, 100)}...
    --- END EMAIL SIMULATION ---`);
    return; // Must return
  }

  try {
    // More robust transporter config, especially for Gmail with port 587
    const transporterConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: parseInt(process.env.EMAIL_PORT, 10) === 465, // true for 465 (SSL), false for others (TLS e.g. 587)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // The App Password
      },
      // Recommended for some environments/providers, not always needed for Gmail+AppPassword
      // tls: {
      //    Uncomment if you suspect TLS handshake issues with your provider
      //    // do not fail on invalid certs (use with caution in dev, never in prod for public servers)
      //    // rejectUnauthorized: false 
      // }
    };
    console.log("emailService: Creating Nodemailer transporter with config (pass excluded):", { ...transporterConfig, auth: { user: transporterConfig.auth.user, pass: '********' }});

    let transporter = nodemailer.createTransport(transporterConfig);
    
    console.log("emailService: Verifying transporter configuration...");
    // transporter.verify() can be problematic or slow sometimes, make it optional or log success/failure explicitly
    try {
        await transporter.verify();
        console.log("emailService: Transporter configuration verified successfully.");
    } catch (verifyError) {
        console.error("emailService WARN: Transporter.verify() failed. This might not prevent sending if config is valid.", verifyError.message);
        // Don't return, still attempt to send
    }


    let mailOptions = {
      from: process.env.EMAIL_FROM_ADDRESS,
      to: adminEmail,
      subject: subject,
      text: bodyText,
      html: bodyHtml,
    };
    console.log("emailService: Preparing to send email with options (to, from, subject):", { to: mailOptions.to, from: mailOptions.from, subject: mailOptions.subject });

    console.log(`emailService: Attempting to send actual email via Nodemailer for ${productName}...`);
    let info = await transporter.sendMail(mailOptions);
    console.log(`%cemailService: Low stock notification email SENT successfully for ${productName} to ${adminEmail}. Message ID: ${info.messageId}`, 'color: green; font-weight: bold;');
    console.log("emailService: Full Nodemailer response:", info.response); // Log the full SMTP response for detailed diagnostics
    console.log("emailService: Nodemailer accepted recipients:", info.accepted);
    console.log("emailService: Nodemailer rejected recipients:", info.rejected);

  } catch (error) {
    console.error(`%cemailService ERROR sending low stock email for ${productName} via Nodemailer: ${error.message}`, 'color: red; font-weight: bold;');
    console.error("emailService: Full Nodemailer error object:", JSON.stringify(error, Object.getOwnPropertyNames(error))); // Log the full error structure
    
    // Provide more specific feedback based on common Nodemailer error codes
    if (error.code === 'EAUTH') {
        console.error("emailService: DETAILED ERROR -> Authentication failed. Please double-check your EMAIL_USER and EMAIL_PASS (App Password). For Gmail, ensure 2-Step Verification is ON and the App Password is correct and active.");
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
        console.error("emailService: DETAILED ERROR -> Connection error. Check your internet, EMAIL_HOST, EMAIL_PORT, and any firewall or antivirus software that might be blocking outbound connections on the specified port.");
    } else if (error.code === 'EENVELOPE') {
        console.error("emailService: DETAILED ERROR -> Email envelope error. The sender (EMAIL_FROM_ADDRESS) or recipient (ADMIN_EMAIL) address might be invalid or rejected by the mail server.");
    } else if (error.responseCode === 535 || (error.response && error.response.includes("5.7.8 Username and Password not accepted"))) {
        console.error("emailService: DETAILED ERROR -> SMTP Error 535: Authentication credentials invalid. Likely an issue with your EMAIL_USER or EMAIL_PASS (App Password).");
    }
  }
  console.log(`--- emailService: Processing for ${productName} finished ---`);
};

module.exports = { sendLowStockNotification };