const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const { data, error } = await resend.emails.send({
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