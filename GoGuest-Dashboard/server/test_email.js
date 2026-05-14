const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'goguest2026@gmail.com',
        pass: (process.env.EMAIL_PASSWORD || 'inserisci_la_password_qui').replace(/\s/g, '')
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log("Using password:", process.env.EMAIL_PASSWORD ? "*****" : "NULL");

    let info = await transporter.sendMail({
      from: '"GoGuest System" <goguest2026@gmail.com>',
      to: 'agoisma@gmail.com',
      subject: "Test Invito",
      text: `Test test`
    });

    console.log("Email inviata con successo!");
  } catch (error) {
    console.error("ERRORE EMAIL:", error);
  }
}
testEmail();
