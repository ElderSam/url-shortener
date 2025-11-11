import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: any;
  }
}
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OptionalAuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const secret = process.env.JWT_SECRET || 'changeme';
        const payload = jwt.verify(token, secret);
        req.user = payload;
      }
      catch {
        // Invalid token: ignore and proceed as anonymous
        req.user = undefined;
      }
    }
    next();
  }
}
