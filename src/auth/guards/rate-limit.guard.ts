import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

const ATTEMPT_LIMIT = 3; // per IP+email
const GLOBAL_ATTEMPT_LIMIT = 10; // per IP
const WINDOW_MS = 60 * 1000; // 1 minute
export const attempts: Record<string, { count: number; timestamp: number }> = {};
export const globalAttempts: Record<string, { count: number; timestamp: number }> = {};

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const email = request.body?.email || '';
    const now = Date.now();

    // Per IP+email
    const key = `${ip}:${email}`;
    if (!attempts[key] || now - attempts[key].timestamp > WINDOW_MS) {
      attempts[key] = { count: 1, timestamp: now };
    } else {
      attempts[key].count++;
      if (attempts[key].count > ATTEMPT_LIMIT) {
        throw new BadRequestException('Too many login attempts for this user. Please try again later.');
      }
    }

    // Global per IP
    if (!globalAttempts[ip] || now - globalAttempts[ip].timestamp > WINDOW_MS) {
      globalAttempts[ip] = { count: 1, timestamp: now };
    } else {
      globalAttempts[ip].count++;
      if (globalAttempts[ip].count > GLOBAL_ATTEMPT_LIMIT) {
        throw new BadRequestException('Too many login attempts from this IP. Please try again later.');
      }
    }

    return true;
  }
}
