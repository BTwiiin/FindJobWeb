import { registerAs } from '@nestjs/config';

export default registerAs('mailer', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  defaults: {
    from: process.env.SMTP_FROM || '"FindJob" <noreply@findjob.com>',
  },
})); 