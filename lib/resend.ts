import { Resend } from 'resend';

// Make sure we have a valid API key
const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  console.warn('RESEND_API_KEY is not defined in environment variables');
}

const resend = new Resend(resendApiKey || 'placeholder_for_development');

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  if (!resendApiKey) {
    console.log('Email would have been sent:', { to, subject });
    return { success: false, error: 'Missing API key' };
  }
  
  try {
    const data = await resend.emails.send({
      from: 'AgriGrow Finance <noreply@yourdomain.com>',
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
} 