import { Injectable, CanActivate, ExecutionContext, BadRequestException } from '@nestjs/common';

const ATTEMPT_LIMIT = 5;
const WINDOW_MS = 60 * 1000; // 1 minute
const attempts: Record<string, { count: number; timestamp: number }> = {};

@Injectable()
export class RateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    if (!attempts[ip] || now - attempts[ip].timestamp > WINDOW_MS) {
      attempts[ip] = { count: 1, timestamp: now };
    } else {
      attempts[ip].count++;
      if (attempts[ip].count > ATTEMPT_LIMIT) {
        throw new BadRequestException('Too many login attempts. Please try again later.');
      }
    }
    return true;
  }
}
