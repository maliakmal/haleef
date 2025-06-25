import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      lastName,
      email,
      phone,
      company,
      interest,
      message,
      privacyAccepted,
      metadata
    } = req.body;

    // Validate required fields
    if (!email || !phone || !company || !interest) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create transporter (using Mailtrap or your SMTP service)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Format email content
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <table>
        <tr><td><strong>Name:</strong></td><td>${name || 'Not provided'} ${lastName || ''}</td></tr>
        <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
        <tr><td><strong>Phone:</strong></td><td>${phone}</td></tr>
        <tr><td><strong>Company:</strong></td><td>${company}</td></tr>
        <tr><td><strong>Interest:</strong></td><td>${interest}</td></tr>
        <tr><td><strong>Message:</strong></td><td>${message || 'No message provided'}</td></tr>
        <tr><td><strong>Privacy Accepted:</strong></td><td>${privacyAccepted ? 'Yes' : 'No'}</td></tr>
        <tr><td colspan="2"><hr></td></tr>
        <tr><td><strong>Post ID:</strong></td><td>${metadata.post_id}</td></tr>
        <tr><td><strong>Form ID:</strong></td><td>${metadata.form_id}</td></tr>
        <tr><td><strong>Referer:</strong></td><td>${metadata.referer_title}</td></tr>
      </table>
    `;

    // Send email
    await transporter.sendMail({
      from: `"${name || 'Website User'}" <${process.env.FROM_EMAIL || 'noreply@yourdomain.com'}>`,
      to: process.env.TO_EMAIL || 'your-email@example.com',
      subject: `New Contact: ${company} - ${interest}`,
      html: emailHtml,
      text: emailHtml.replace(/<[^>]*>/g, '') // Plain text version
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing form:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}