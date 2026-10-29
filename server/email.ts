import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { getAppSetting } from './db.js';

export interface LetterRecord {
  id: string;
  recipient_email: string;
  recipient_name?: string | null;
  sender_name?: string | null;
  view_token?: string | null;
  title: string;
  content: string;
  deliver_at: string;
  timezone: string;
  created_at: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  provider: 'resend' | 'smtp' | 'ethereal' | 'console';
  error?: string;
}

let etherealTransporter: nodemailer.Transporter | null = null;

// Helper to sanitize HTML content to prevent injections in email clients
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function getLetterViewUrl(letter: LetterRecord): string {
  const baseUrl = (process.env.APP_URL || process.env.BASE_URL || 'http://localhost:5173').replace(/\/+$/, '');
  const token = letter.view_token || letter.id;
  return `${baseUrl}/letter/${token}`;
}

export function generateLetterHtml(letter: LetterRecord): string {
  const safeTitle = escapeHtml(letter.title);
  const viewUrl = getLetterViewUrl(letter);

  const formattedContent = escapeHtml(letter.content)
    .split('\n')
    .map(line => line.trim() === '' ? '<br/>' : `<p style="margin: 0 0 16px 0; line-height: 1.85; font-size: 16px; color: #3B251D;">${line}</p>`)
    .join('');

  const writtenDate = new Date(letter.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const senderDisplay = letter.sender_name?.trim()
    ? escapeHtml(letter.sender_name.trim())
    : 'Your Past Self';

  const recipientDisplay = letter.recipient_name?.trim()
    ? escapeHtml(letter.recipient_name.trim())
    : null;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>A letter from the past 💌</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #2B1B15; font-family: 'Georgia', serif; color: #3B251D;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 620px; margin: 0 auto;">
    <tr>
      <td style="padding: 0;">
        
        <!-- ==========================================
             TOP CALL-TO-ACTION CARD: BEAUTIFUL CLICKABLE LINK 
             ========================================== -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAF5EE; border: 2px solid #722F37; border-radius: 14px 14px 0 0; border-bottom: 2px dashed #A88968; text-align: center; box-shadow: 0 4px 16px rgba(0,0,0,0.25);">
          <tr>
            <td style="padding: 24px 22px 20px 22px; background: linear-gradient(180deg, #FFFDF9 0%, #F5EBDD 100%); border-radius: 12px 12px 0 0;">
              <div style="font-size: 11px; letter-spacing: 2.5px; color: #722F37; text-transform: uppercase; font-weight: bold; margin-bottom: 6px;">
                ✦ Dedicated Vintage Diary Page ✦
              </div>
              <div style="font-size: 19px; color: #2B1B15; font-family: 'Georgia', serif; font-style: italic; font-weight: bold; line-height: 1.35; margin-bottom: 12px;">
                “Your letter has been preserved in time.”
              </div>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #634832; line-height: 1.5; max-width: 460px; margin-left: auto; margin-right: auto;">
                Click below to open this letter on your private, beautifully designed vintage diary page with aged parchment and delicate calligraphy:
              </p>
              
              <!-- Prominent CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="border-radius: 30px; background-color: #722F37; box-shadow: 0 4px 12px rgba(114, 47, 55, 0.38);">
                    <a href="${viewUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; padding: 14px 32px; font-family: 'Georgia', serif; font-size: 15px; font-weight: bold; color: #FFF8EE; text-decoration: none; border-radius: 30px; border: 1.5px solid #D6C0A5; letter-spacing: 0.5px;">
                      📖 Read Full Letter on Dedicated Diary Page ➔
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 10px; font-size: 11px; color: #8C6D53; font-style: italic;">
                Private & Secure · Click to open on mobile or desktop
              </div>
            </td>
          </tr>
        </table>

        <!-- Vintage Header Ribbon -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #4A3026; padding: 12px 24px; text-align: center; border-left: 1px solid #A88968; border-right: 1px solid #A88968;">
          <tr>
            <td>
              <div style="font-size: 12px; letter-spacing: 3px; color: #D6C0A5; text-transform: uppercase;">
                ✧ ⋆｡°✩ DEAR TOMORROW · TIME ARCHIVES ✩°｡⋆ ✧
              </div>
            </td>
          </tr>
        </table>

        <!-- Main Letter Content Preview on Warm Parchment -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5EBDD; border-left: 1px solid #A88968; border-right: 1px solid #A88968; padding: 32px 28px; box-shadow: inset 0 0 35px rgba(56, 32, 22, 0.08);">
          <tr>
            <td>
              
              <!-- Postmark Stamp, Origin & Recipient Details -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-bottom: 1px dashed #A88968; padding-bottom: 16px;">
                <tr>
                  <td align="left" style="vertical-align: top;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #722F37; font-weight: bold;">
                      📮 Letter Preview
                    </div>
                    <div style="font-size: 14px; color: #382016; margin-top: 5px;">
                      <strong>Penned on:</strong> ${writtenDate}
                    </div>
                    <div style="font-size: 13px; color: #634832; margin-top: 3px;">
                      <strong>From:</strong> <em>${senderDisplay}</em>
                    </div>
                    ${recipientDisplay ? `
                    <div style="font-size: 13px; color: #634832; margin-top: 2px;">
                      <strong>To:</strong> <em>${recipientDisplay}</em>
                    </div>
                    ` : ''}
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="display: inline-block; border: 1.5px dashed #722F37; padding: 6px 10px; border-radius: 6px; font-size: 10px; text-transform: uppercase; color: #382016; letter-spacing: 1px; text-align: center; background: rgba(226, 208, 184, 0.5);">
                      ✦ TIME-POSTED ✦<br/>
                      <span style="font-size: 8px; color: #722F37; font-weight: bold;">DELIVERED</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Letter Title -->
              <h1 style="font-size: 23px; color: #2B1B15; margin: 0 0 20px 0; font-weight: normal; font-style: italic; border-bottom: 1.5px solid #D6C0A5; padding-bottom: 10px;">
                “${safeTitle}”
              </h1>

              <!-- Letter Text Content -->
              <div style="font-size: 16px; line-height: 1.85; color: #382016; background: rgba(255, 253, 249, 0.65); padding: 22px; border-radius: 8px; border-left: 3px solid #722F37;">
                ${formattedContent}
              </div>

              <!-- Secondary Link & Wax Seal -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${viewUrl}" target="_blank" rel="noopener noreferrer" style="color: #722F37; font-size: 14px; font-style: italic; font-weight: bold; text-decoration: underline;">
                      Click here to visit your permanent letter sanctuary ➔
                    </a>
                    
                    <div style="margin-top: 20px;">
                      <div style="display: inline-block; width: 52px; height: 52px; border-radius: 50%; background: #722F37; border: 2.5px double #D6C0A5; line-height: 48px; text-align: center; color: #FAF5EE; font-size: 17px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                        DT
                      </div>
                      <div style="font-size: 11px; color: #634832; margin-top: 6px; font-style: italic;">
                        Sealed in timeless remembrance
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Vintage Footer -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #2B1B15; border-radius: 0 0 14px 14px; padding: 24px; text-align: center; border-top: 2px solid #722F37;">
          <tr>
            <td>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #FAF5EE; font-style: italic;">
                “Written with love, by the you who existed back then.”
              </p>
              <p style="margin: 0; font-size: 11px; color: #A88968; letter-spacing: 0.5px;">
                Dear Tomorrow · Letters across time ☾ · Ref: #${letter.id}
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateLetterPlainText(letter: LetterRecord): string {
  const writtenDate = new Date(letter.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const viewUrl = getLetterViewUrl(letter);
  const senderDisplay = letter.sender_name?.trim() || 'Your Past Self';

  return `
======================================================
           *~*~* DEAR TOMORROW *~*~*
     A letter from the past, delivered today
======================================================

📖 VIEW YOUR COMPLETE VINTAGE DIARY LETTER ONLINE:
${viewUrl}

------------------------------------------------------
Penned on: ${writtenDate}
From: ${senderDisplay}
${letter.recipient_name ? `To: ${letter.recipient_name}\n` : ''}Subject: ${letter.title}
Reference: #${letter.id}
------------------------------------------------------

${letter.content}

------------------------------------------------------
Open your private letter page:
${viewUrl}

"Written with love, by the you who existed back then."
Made for the person you're becoming. ☾
======================================================
  `.trim();
}

export async function sendLetterEmail(letter: LetterRecord): Promise<SendResult> {
  const subject = `A letter from your past self 💌: ${letter.title}`;
  const html = generateLetterHtml(letter);
  const text = generateLetterPlainText(letter);

  // 1. Check for Resend API Key (env or database)
  const resendApiKey = process.env.RESEND_API_KEY || (await getAppSetting('resend_api_key'));
  const customEmailFrom = process.env.EMAIL_FROM || (await getAppSetting('email_from'));

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey.trim());
      const fromEmail = customEmailFrom || 'Dear Tomorrow <letters@deartomorrow.app>';
      const result = await resend.emails.send({
        from: fromEmail,
        to: letter.recipient_email,
        subject,
        html,
        text,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      console.log(`[Email] Sent letter #${letter.id} via Resend to ${letter.recipient_email}`);
      return {
        success: true,
        messageId: result.data?.id,
        provider: 'resend',
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`[Email] Resend error for letter #${letter.id}:`, errMsg);
      const smtpUserFallback = process.env.SMTP_USER || (await getAppSetting('smtp_user'));
      if (!smtpUserFallback) {
        return {
          success: false,
          error: `Resend delivery failed: ${errMsg}`,
          provider: 'resend',
        };
      }
    }
  }

  // 2. Check for custom SMTP configuration (Gmail or generic SMTP)
  const smtpUser = process.env.SMTP_USER || (await getAppSetting('smtp_user'));
  const smtpPass = process.env.SMTP_PASS || (await getAppSetting('smtp_pass'));
  const smtpHost = process.env.SMTP_HOST || (await getAppSetting('smtp_host')) || 'smtp.gmail.com';
  const smtpPortStr = process.env.SMTP_PORT || (await getAppSetting('smtp_port')) || '587';
  const smtpSecureStr = process.env.SMTP_SECURE || (await getAppSetting('smtp_secure'));

  if (smtpUser && smtpPass) {
    try {
      const host = smtpHost.trim();
      const user = smtpUser.trim();
      const pass = smtpPass.trim().replace(/\s+/g, '');
      const isGmail = host.toLowerCase().includes('gmail') || user.toLowerCase().endsWith('@gmail.com');

      const transportOptions: any = isGmail
        ? {
            service: 'gmail',
            auth: { user, pass },
          }
        : {
            host,
            port: Number(smtpPortStr) || 587,
            secure: smtpSecureStr === 'true' || smtpSecureStr === '1',
            auth: { user, pass },
          };

      const transporter = nodemailer.createTransport(transportOptions);

      const info = await transporter.sendMail({
        from: customEmailFrom || `"Dear Tomorrow" <${user}>`,
        to: letter.recipient_email,
        subject,
        html,
        text,
      });

      console.log(`[Email] Successfully dispatched letter #${letter.id} via SMTP to ${letter.recipient_email}`);
      return {
        success: true,
        messageId: info.messageId,
        provider: 'smtp',
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`[Email] SMTP delivery failure for letter #${letter.id}:`, errMsg);

      let friendlyError = errMsg;
      if (
        errMsg.includes('535') ||
        errMsg.includes('BadCredentials') ||
        errMsg.includes('Username and Password not accepted')
      ) {
        friendlyError =
          'Gmail rejected the password. Google requires a 16-character App Password (not your normal Google account password). Go to https://myaccount.google.com/apppasswords to generate one, then enter it in Email Settings.';
      }

      return {
        success: false,
        error: friendlyError,
        provider: 'smtp',
      };
    }
  }

  // 3. Fallback only if NO credentials configured: Ethereal Email test account (generates real web preview link)
  try {
    if (!etherealTransporter) {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email] Initialized test Ethereal account: ${testAccount.user}`);
    }

    const info = await etherealTransporter.sendMail({
      from: '"Dear Tomorrow" <letters@deartomorrow.ethereal.email>',
      to: letter.recipient_email,
      subject,
      html,
      text,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`[Email] Sent letter #${letter.id} to Ethereal inbox! Preview URL: ${previewUrl}`);

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
      provider: 'ethereal',
      error: 'Sent to Ethereal sandbox preview only. Real inbox delivery requires Gmail SMTP or Resend credentials in environment variables.',
    };
  } catch (err: any) {
    console.warn(`[Email] Could not create Ethereal transporter, falling back to simulated log delivery:`, err?.message);
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      provider: 'console',
      error: 'Simulated delivery only. Real inbox delivery requires Gmail SMTP or Resend credentials in environment variables.',
    };
  }
}
