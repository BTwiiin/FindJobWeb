import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl, ip, body } = req;

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Request from ${ip}`);
  if (body && Object.keys(body).length > 0) {
    console.log('Request Body:', JSON.stringify(body, null, 2));
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (body: any): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusCode = res.statusCode;

    // Log response
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);
    if (body) {
      try {
        // If body is already an object, use it directly
        const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        console.log('Response Body:', JSON.stringify(responseBody, null, 2));
      } catch (e) {
        // If parsing fails, log the original body
        console.log('Response Body:', body);
      }
    }

    return originalSend.call(this, body);
  };

  next();
} 