import nodemailer from 'nodemailer';

interface SendEmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: any;
    contentType?: string;
  }>;
}

const sendEmail = async (options: SendEmailOptions) => {
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
  const mailOptions: any = {
    from: 'Paymint <noreply@paymint.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  if (options.html) {
    mailOptions.html = options.html;
  }

  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
