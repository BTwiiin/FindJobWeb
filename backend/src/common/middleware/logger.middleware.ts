import { Request, Response, NextFunction } from 'express';

const MAX_BODY_LENGTH = 500; // Maximum length of response body to log

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - Request from ${ip}`);

  // Capture response
  const originalSend = res.send;
  res.send = function (body: any): Response {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const statusCode = res.statusCode;

    // Log response with status and duration
    console.log(`[${new Date().toISOString()}] ${method} ${originalUrl} - ${statusCode} - ${duration}ms`);

    // Only log response body for errors or if it's small
    if (statusCode >= 400 || (body && typeof body === 'object' && Object.keys(body).length <= 3)) {
      try {
        const responseBody = typeof body === 'string' ? JSON.parse(body) : body;
        const bodyStr = JSON.stringify(responseBody);
        const truncatedBody = bodyStr.length > MAX_BODY_LENGTH 
          ? bodyStr.substring(0, MAX_BODY_LENGTH) + '...' 
          : bodyStr;
        console.log('Response:', truncatedBody);
      } catch (e) {
        // If parsing fails, log the original body
        console.log('Response:', body);
      }
    }

    return originalSend.call(this, body);
  };

  next();
} 