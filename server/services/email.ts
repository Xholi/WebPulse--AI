import nodemailer from 'nodemailer';
import { EmailCampaign } from '@shared/schema';
import { storage } from '../storage';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendPreviewEmail(email: string, businessName: string, previewUrl: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'WebPulse AI <noreply@webpulse.ai>',
      to: email,
      subject: `Your New Website Preview - ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Your Website is Ready!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">WebPulse AI has generated a custom website for ${businessName}</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi there!</h2>
            <p style="color: #475569; line-height: 1.6;">
              We've created a beautiful, professional website for <strong>${businessName}</strong> using AI-powered design.
              Your website includes:
            </p>
            
            <ul style="color: #475569; line-height: 1.8;">
              <li>Professional design tailored to your industry</li>
              <li>Contact information and business details</li>
              <li>Mobile-responsive layout</li>
              <li>SEO optimization</li>
              <li>Contact form integration</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${previewUrl}" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block;">
                Preview Your Website
              </a>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              <strong>Next Steps:</strong><br>
              1. Click the link above to preview your website<br>
              2. If you're happy with it, approve the design<br>
              3. Pay the 60% deposit to get your final website<br>
              4. We'll deliver your complete website within 24 hours
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>Special Offer:</strong> Approve within 48 hours and get a 15% discount on your deposit!
              </p>
            </div>
          </div>
          
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px;">
            <p>© 2024 WebPulse AI. All rights reserved.</p>
            <p>Need help? Reply to this email or contact our support team.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Preview email sent to ${email} for ${businessName}`);
    } catch (error) {
      console.error('Error sending preview email:', error);
      throw error;
    }
  }

  async sendPaymentConfirmation(email: string, businessName: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'WebPulse AI <noreply@webpulse.ai>',
      to: email,
      subject: `Payment Confirmed - ${businessName} Website Development`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Payment Confirmed!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your website development is now in progress</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-top: 0;">Thank you, ${businessName}!</h2>
            <p style="color: #475569; line-height: 1.6;">
              We've successfully received your 60% deposit payment. Your website development is now prioritized and will be completed within <strong>2 - 3 Business Day's </strong>.
            </p>
            
            <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #15803d; margin-top: 0;">What happens next?</h3>
              <ol style="color: #166534; line-height: 1.8; padding-left: 20px;">
                <li>Our team will finalize your website design</li>
                <li>We'll optimize all content and images</li>
                <li>Your website will be deployed to your custom domain</li>
                <li>You'll receive login credentials and instructions</li>
                <li>We'll provide ongoing support for the first month</li>
              </ol>
            </div>
            
            <p style="color: #475569; line-height: 1.6;">
              You'll receive another email within 72 hours with your completed website and all necessary details.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b; font-size: 14px;">Track your project status anytime</p>
              <a href="#" style="background: #3B82F6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Project Dashboard
              </a>
            </div>
          </div>
          
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px;">
            <p>© 2024 WebPulse AI. All rights reserved.</p>
            <p>Questions? Reply to this email or call us at (+27) 7620-3614</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Payment confirmation sent to ${email} for ${businessName}`);
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      throw error;
    }
  }

  async sendReminder(email: string, businessName: string) {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'WebPulse AI <noreply@webpulse.ai>',
      to: email,
      subject: `Don't Miss Out - Your ${businessName} Website Preview`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Still Interested?</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your website preview is waiting for review</p>
          </div>
          
          <div style="padding: 30px; background: #f8fafc;">
            <h2 style="color: #1e293b; margin-top: 0;">Hi ${businessName},</h2>
            <p style="color: #475569; line-height: 1.6;">
              We noticed you haven't had a chance to review your website preview yet. Your professionally designed website is ready and waiting for your approval.
            </p>
            
            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">⏰ Limited Time Offer</h3>
              <p style="color: #92400e; margin: 0;">
                Approve your website in the next 24 hours and get <strong>15% off</strong> your deposit payment!
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; display: inline-block;">
                Review Your Website Now
              </a>
            </div>
            
            <p style="color: #475569; line-height: 1.6; font-size: 14px;">
              If you're no longer interested, simply reply to this email and we'll remove you from our follow-up list.
            </p>
          </div>
          
          <div style="background: #1e293b; color: #94a3b8; padding: 20px; text-align: center; font-size: 14px;">
            <p>© 2024 WebPulse AI. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${email} for ${businessName}`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
      throw error;
    }
  }

  async sendCampaign(campaign: EmailCampaign) {
    // Get recipient leads
    const recipientIds = campaign.recipients as number[];
    
    for (const leadId of recipientIds) {
      const lead = await storage.getLeadById(leadId);
      if (lead && lead.email) {
        const mailOptions = {
          from: process.env.SMTP_FROM || 'WebPulse AI <noreply@webpulse.ai>',
          to: lead.email,
          subject: campaign.subject,
          html: campaign.template.replace(/\{\{businessName\}\}/g, lead.name),
        };

        try {
          await this.transporter.sendMail(mailOptions);
          console.log(`Campaign email sent to ${lead.email}`);
        } catch (error) {
          console.error(`Error sending campaign email to ${lead.email}:`, error);
        }
      }
    }
  }

  async sendDevelopmentStarted(email: string, businessName: string, estimatedCompletion: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Development Started for ${businessName}</h2>
        <p>Great news! Your website development has officially begun.</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">What happens next:</h3>
          <ul style="line-height: 1.6;">
            <li>Our development team is creating your pre-built website</li>
            <li>Development time: 3-5 business days</li>
            <li>Estimated completion: <strong>${estimatedCompletion}</strong></li>
            <li>You'll receive an email when your website is ready</li>
          </ul>
        </div>
        
        <p>Your deposit has been received and development is now in progress. We'll keep you updated on the progress.</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for choosing WebPulse AI<br>
          Building your digital presence
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@webpulse.ai',
      to: email,
      subject: `Development Started - ${businessName} Website`,
      html,
    });
  }

  async sendWebsiteCompleted(email: string, businessName: string, websiteUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #059669;">Your Website is Ready!</h2>
        <p>Excellent news! Your pre-built website for <strong>${businessName}</strong> has been completed.</p>
        
        <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #047857;">Your website is live at:</h3>
          <p style="font-size: 18px; margin: 10px 0;">
            <a href="${websiteUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${websiteUrl}</a>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">What's included:</h3>
          <ul style="line-height: 1.6;">
            <li>Fully responsive design optimized for all devices</li>
            <li>Professional branding and color scheme</li>
            <li>Contact forms and business information</li>
            <li>SEO optimization for better search visibility</li>
            <li>Fast loading and mobile-friendly</li>
          </ul>
        </div>
        
        <p>Please review your website and let us know if you need any adjustments. Your website is now ready to attract customers!</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Thank you for choosing WebPulse AI<br>
          Your digital presence is now live
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@webpulse.ai',
      to: email,
      subject: `Your Website is Ready - ${businessName}`,
      html,
    });
  }

  async sendWebsiteDelivered(email: string, businessName: string, websiteUrl: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Website Delivered - ${businessName}</h2>
        <p>Your website has been officially delivered and is now live for your customers.</p>
        
        <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #7c3aed;">
          <h3 style="margin-top: 0; color: #6b21a8;">Your live website:</h3>
          <p style="font-size: 18px; margin: 10px 0;">
            <a href="${websiteUrl}" style="color: #2563eb; text-decoration: none; font-weight: bold;">${websiteUrl}</a>
          </p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Next steps:</h3>
          <ul style="line-height: 1.6;">
            <li>Share your website URL with customers</li>
            <li>Update your business listings with the new website</li>
            <li>Consider adding your website to business cards and marketing materials</li>
            <li>Monitor your website traffic and customer inquiries</li>
          </ul>
        </div>
        
        <p>Thank you for choosing WebPulse AI. We're excited to see your business grow with your new website!</p>
        
        <p style="color: #6b7280; font-size: 14px;">
          Need support? Reply to this email<br>
          WebPulse AI - Building your digital presence
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@webpulse.ai',
      to: email,
      subject: `Website Delivered - ${businessName} is Live!`,
      html,
    });
  }
}

export const emailService = new EmailService();
