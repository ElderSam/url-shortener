import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = exception;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        error = null;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || message;
        if (status === HttpStatus.CONFLICT) {
          error = message;
        } else {
          error = (res as any).error || null;
        }
      }
    }

    response.status(status).json({
      data: null,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
