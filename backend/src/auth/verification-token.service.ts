import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

@Injectable()
export class VerificationTokenService {
    private readonly TOKEN_LENGTH = 32;
    private readonly TOKEN_EXPIRY_HOURS = 24;

    generateToken(): string {
        return randomBytes(this.TOKEN_LENGTH).toString('hex');
    }

    getExpiryDate(): Date {
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + this.TOKEN_EXPIRY_HOURS);
        return expiryDate;
    }

    isTokenExpired(expiryDate: Date): boolean {
        return new Date() > expiryDate;
    }
} 