import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SentMessageInfo } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailerService {
    private readonly logger = new Logger(MailerService.name);
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        const config: SMTPTransport.Options = {
            host: this.configService.get('mailer.host'),
            port: this.configService.get('mailer.port'),
            secure: this.configService.get('mailer.secure'),
            auth: this.configService.get('mailer.auth'),
        };
        this.transporter = nodemailer.createTransport(config);
    }

    async sendEmail(to: string, subject: string, html: string): Promise<SentMessageInfo> {
        try {
            const info = await this.transporter.sendMail({
                to,
                subject,
                html,
                from: this.configService.get('mailer.defaults.from'),
            });
            this.logger.log(`Email sent successfully to ${to}`);
            return info;
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendVerificationEmail(to: string, token: string): Promise<SentMessageInfo> {
        const verificationUrl = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
        const html = `
            <h1>Verify your email</h1>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">${verificationUrl}</a>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
        `;
        return this.sendEmail(to, 'Verify your email', html);
    }

    async sendPasswordResetEmail(to: string, token: string): Promise<SentMessageInfo> {
        const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
        const html = `
            <h1>Reset your password</h1>
            <p>Please click the link below to reset your password:</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
        `;
        return this.sendEmail(to, 'Reset your password', html);
    }

    async sendJobApplicationNotification(to: string, jobTitle: string, applicantName: string): Promise<SentMessageInfo> {
        const html = `
            <h1>New Job Application</h1>
            <p>You have received a new application for the job "${jobTitle}" from ${applicantName}.</p>
            <p>Please log in to your dashboard to review the application.</p>
        `;
        return this.sendEmail(to, `New application for ${jobTitle}`, html);
    }

    async sendApplicationStatusUpdate(to: string, jobTitle: string, status: string): Promise<SentMessageInfo> {
        const html = `
            <h1>Application Status Update</h1>
            <p>Your application for "${jobTitle}" has been ${status}.</p>
            <p>Please log in to your dashboard to view more details.</p>
        `;
        return this.sendEmail(to, `Application status update for ${jobTitle}`, html);
    }
} 