const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { type, to, data } = JSON.parse(event.body);

    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured, skipping email');
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Email sending disabled (no API key)' }),
      };
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
    const eventName = process.env.REACT_APP_EVENT_NAME || 'Event';

    let emailContent = {};

    switch (type) {
      case 'session_submitted':
        emailContent = {
          subject: `Session Submitted - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3B82F6;">Session Submitted Successfully!</h2>
              <p>Hi ${data.speakerName},</p>
              <p>Thank you for submitting your session proposal for ${eventName}.</p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #333;">Session Details:</h3>
                <p><strong>Title:</strong> ${data.sessionTitle}</p>
                <p><strong>Type:</strong> ${data.sessionType}</p>
              </div>
              <p>Our review team will evaluate your submission and notify you of the decision soon.</p>
              <p>Best regards,<br>${eventName} Team</p>
            </div>
          `
        };
        break;

      case 'session_approved':
        emailContent = {
          subject: `Session Approved - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #10B981;">Congratulations! Your Session is Approved!</h2>
              <p>Hi ${data.speakerName},</p>
              <p>Great news! Your session has been approved for ${eventName}.</p>
              <div style="background-color: #f0f9f0; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
                <h3 style="margin-top: 0; color: #333;">Approved Session:</h3>
                <p><strong>Title:</strong> ${data.sessionTitle}</p>
              </div>
              ${data.feedback ? `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Reviewer Feedback:</h4>
                  <p style="font-style: italic;">${data.feedback}</p>
                </div>
              ` : ''}
              <p>Please confirm your availability to speak at the event. We'll be in touch with more details soon.</p>
              <p>Best regards,<br>${eventName} Team</p>
            </div>
          `
        };
        break;

      case 'session_rejected':
        emailContent = {
          subject: `Session Review Update - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #EF4444;">Session Review Update</h2>
              <p>Hi ${data.speakerName},</p>
              <p>Thank you for your submission to ${eventName}. After careful review, we won't be able to include your session in this year's program.</p>
              <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EF4444;">
                <h3 style="margin-top: 0; color: #333;">Session:</h3>
                <p><strong>Title:</strong> ${data.sessionTitle}</p>
              </div>
              ${data.feedback ? `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Reviewer Feedback:</h4>
                  <p style="font-style: italic;">${data.feedback}</p>
                </div>
              ` : ''}
              <p>We had many excellent submissions this year and the selection was highly competitive. We encourage you to submit again for future events.</p>
              <p>Best regards,<br>${eventName} Team</p>
            </div>
          `
        };
        break;

      case 'session_hold':
        emailContent = {
          subject: `Session on Hold - ${eventName}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #F59E0B;">Session Under Further Review</h2>
              <p>Hi ${data.speakerName},</p>
              <p>Your session submission for ${eventName} is currently on hold for further review.</p>
              <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
                <h3 style="margin-top: 0; color: #333;">Session:</h3>
                <p><strong>Title:</strong> ${data.sessionTitle}</p>
              </div>
              ${data.feedback ? `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">Additional Notes:</h4>
                  <p style="font-style: italic;">${data.feedback}</p>
                </div>
              ` : ''}
              <p>We're still evaluating this submission and will update you with a final decision soon.</p>
              <p>Best regards,<br>${eventName} Team</p>
            </div>
          `
        };
        break;

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    const msg = {
      to,
      from: fromEmail,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };

  } catch (error) {
    console.error('Email sending error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to send email',
        details: error.message 
      }),
    };
  }
};