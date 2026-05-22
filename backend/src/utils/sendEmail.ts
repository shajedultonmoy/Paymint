import nodemailer from 'nodemailer';

const sendEmail = async (options: { email: string, subject: string, message: string }) => {
  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525', 10),
    auth: {
      user: process.env.EMAIL_USER || 'user',
      pass: process.env.EMAIL_PASS || 'pass',
    },
  });

  // Define email options
  const mailOptions = {
    from: 'Paymint <noreply@paymint.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.html,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
