import type { BusinessSettings } from '../config';

export interface BaseLayoutOptions {
  settings: BusinessSettings;
  content: string;
  title?: string;
  preheader?: string;
}

export function baseLayout({
  settings,
  content,
  title,
  preheader,
}: BaseLayoutOptions): string {
  const headerColor = '#1a1a2e';
  const accentColor = '#e94560';
  const textColor = '#333333';
  const bgColor = '#f5f5f5';
  const footerColor = '#666666';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  ${title ? `<title>${title}</title>` : ''}
  ${preheader ? `<meta name="viewport" content="width=device-width, initial-scale=1.0"><style type="text/css">.preheader { display: none !important; visibility: hidden; mso-hide: none; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; } .email-container { max-width: 600px; margin: 0 auto; } .header { background-color: ${headerColor}; padding: 30px 20px; text-align: center; } .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px; } .header .accent-line { width: 60px; height: 3px; background-color: ${accentColor}; margin: 12px auto 0; border-radius: 2px; } .content { background-color: #ffffff; padding: 40px 30px; } .footer { background-color: ${headerColor}; padding: 30px 20px; text-align: center; } .footer p { color: ${footerColor}; margin: 0 0 8px; font-size: 13px; line-height: 1.6; } .footer a { color: ${accentColor}; text-decoration: none; } .btn { display: inline-block; padding: 14px 32px; background-color: ${accentColor}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 20px 0; } .info-box { background-color: #f8f9fa; border-left: 4px solid ${accentColor}; padding: 16px 20px; margin: 20px 0; border-radius: 0 4px 4px 0; } .divider { border: none; border-top: 1px solid #eeeeee; margin: 24px 0; } .table-container { width: 100%; margin: 20px 0; } .table-container table { width: 100%; border-collapse: collapse; } .table-container th { text-align: left; padding: 10px 12px; border-bottom: 2px solid ${headerColor}; color: ${headerColor}; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; } .table-container td { padding: 10px 12px; border-bottom: 1px solid #eeeeee; font-size: 14px; color: ${textColor}; } .total-row td { border-bottom: 2px solid ${headerColor}; font-weight: 700; font-size: 16px; }</style>` : ''}
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${bgColor};">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <div class="email-container">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; width: 100%;">
            <!-- Header -->
            <tr>
              <td class="header" style="background-color: ${headerColor}; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.5px;">
                  ${settings.storeName}
                </h1>
                <div style="width: 60px; height: 3px; background-color: ${accentColor}; margin: 12px auto 0; border-radius: 2px;"></div>
              </td>
            </tr>
            <!-- Content -->
            <tr>
              <td style="background-color: #ffffff; padding: 40px 30px;">
                ${content}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td class="footer" style="background-color: ${headerColor}; padding: 30px 20px; text-align: center; border-radius: 0 0 8px 8px;">
                <p style="color: ${footerColor}; margin: 0 0 8px; font-size: 13px; line-height: 1.6;">
                  ${settings.storeName}
                </p>
                <p style="color: ${footerColor}; margin: 0 0 8px; font-size: 13px; line-height: 1.6;">
                  ${settings.storeAddress ? `${settings.storeAddress}<br>` : ''}
                  ${settings.storeEmail ? `<a href="mailto:${settings.storeEmail}" style="color: ${accentColor}; text-decoration: none;">${settings.storeEmail}</a>` : ''}
                  ${settings.storePhone ? ` &bull; ${settings.storePhone}` : ''}
                </p>
                <p style="color: ${footerColor}; margin: 0 0 8px; font-size: 13px; line-height: 1.6;">
                  <a href="${settings.storeWebsite}" style="color: ${accentColor}; text-decoration: none;">Visit our store</a>
                </p>
                <p style="color: #999999; margin: 16px 0 0; font-size: 11px; line-height: 1.6;">
                  &copy; ${new Date().getFullYear()} ${settings.storeName}. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
