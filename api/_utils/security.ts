
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Fallback key only for dev environments; Production must use VITE_MASTER_KEY
const MASTER_KEY = process.env.VITE_MASTER_KEY || '12345678901234567890123456789012';
const IV_LENGTH = 16;

export const security = {
    encrypt: (text: string): string => {
        if (!text) return '';
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = crypto.createHash('sha256').update(String(MASTER_KEY)).digest();
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    },

    decrypt: (text: string): string => {
        if (!text) return '';
        try {
            const textParts = text.split(':');
            const iv = Buffer.from(textParts.shift() as string, 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const key = crypto.createHash('sha256').update(String(MASTER_KEY)).digest();
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            console.error("Decryption failed:", error);
            return '';
        }
    }
};
