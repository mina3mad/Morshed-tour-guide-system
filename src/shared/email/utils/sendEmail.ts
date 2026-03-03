// import sgMail from '@sendgrid/mail' 
// // sgMail.setDataResidency('eu'); 
// interface SendEmailOptions {
//   to: string;
//   subject: string;
//   html?: string;
//   text?: string;
// }

// export const sendEmail = async ({
//   to,
//   subject,
//   html,
//   text,
// }: SendEmailOptions): Promise<void> => {
//   try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     // console.log(object);
//     await sgMail.send({
//       to,
//       from: "minaemad15870@gmail.com",
//       text:"hello",
//       subject,
//       html,
//     });

//     console.log('Email sent successfully');
//   } catch (error: any) {
//     console.error('SendGrid Error:', error.response?.body || error.message);
//     throw new Error('Failed to send email');
//   }
// };
const nodemailer = require("nodemailer");

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export const sendEmail =async({
  to,
  subject,
  html,
  text,
}: SendEmailOptions)=> {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT), // if secure false port = 587, if true port= 465
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // 2) Define email options (like from, to, subject, email content)
    const mailOpts = {
      from: "GuideHub System <GuideHubMailer@gmail.com>",
      to,
      subject: subject,
      html
    };

    // 3) Send email
    await transporter.sendMail(mailOpts);
}

