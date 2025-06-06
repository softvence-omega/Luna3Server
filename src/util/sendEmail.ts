import nodemailer from 'nodemailer';
import config from '../config';


export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: `${config.companyGmail}`,
        pass: `${config.GmailAppPassword}`,
      },
    });

    const info = await transporter.sendMail({
      from: `${config.companyGmail}`,
      to,
      subject,
      text: 'This E-mail is from LUNA',
      html,
    });

    console.log('Message sent: %s', info.messageId, 'info is', info);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (err) {
    console.error('❌ Email sending failed:', err);
    return {
      success: false,
      error: 'Failed to send email',
    };
  }
};
