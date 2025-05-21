// testEmail.js
require('dotenv').config(); // Make sure to install dotenv: npm install dotenv
const nodemailer = require('nodemailer');

async function sendTestEmail() {
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log("EMAIL_PASS defined:", !!process.env.EMAIL_PASS); // Don't log the actual password
    console.log("EMAIL_HOST:", process.env.EMAIL_HOST);
    console.log("EMAIL_PORT:", process.env.EMAIL_PORT);

    const transporterConfig = {
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: parseInt(process.env.EMAIL_PORT, 10) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // For debugging, add more logging
        // logger: true,
        // debug: true, // Or use this for even more verbosity
    };

    console.log("Transporter Config:", { ...transporterConfig, auth: { user: transporterConfig.auth.user, pass: '********' } });

    let transporter = nodemailer.createTransport(transporterConfig);

    try {
        console.log("Verifying transporter...");
        await transporter.verify();
        console.log("Transporter verified successfully.");
    } catch (err) {
        console.error("Transporter verification failed:", err);
        // Decide if you want to proceed even if verify fails for the test
    }

    let mailOptions = {
        from: process.env.EMAIL_FROM_ADDRESS || `"Test System" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL, // Your admin email
        subject: 'Nodemailer Test Email',
        text: 'This is a test email from Nodemailer.',
        html: '<p>This is a test email from Nodemailer.</p>',
    };

    console.log("Sending test email to:", mailOptions.to);
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Test email sent: ' + info.response);
        console.log("Message ID: %s", info.messageId);
        console.log("Accepted: %s", info.accepted);
        console.log("Rejected: %s", info.rejected);
    } catch (error) {
        console.error('Error sending test email:', error);
        console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        if (error.responseCode === 535) {
             console.error(">>> STILL GETTING 535 Authentication Error. Double check App Password and Google Account security settings.");
        }
    }
}

sendTestEmail();