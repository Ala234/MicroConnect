const { Resend } = require('resend');

let resendClient;
const getResend = () => {
  if (!resendClient) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set in .env');
    }
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await getResend().emails.send({
    from: 'MicroConnect <onboarding@resend.dev>',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Resend error:', error);
    throw new Error(error.message || 'Failed to send email');
  }

  return data;
};

module.exports = sendEmail;