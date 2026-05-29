import { isProduction, isDevelopment } from '../config/env.js';

const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  error(message, meta = {}) {
    console.error(formatMessage(LogLevel.ERROR, message, meta));
  },

  warn(message, meta = {}) {
    if (isDevelopment()) {
      console.warn(formatMessage(LogLevel.WARN, message, meta));
    }
  },

  info(message, meta = {}) {
    if (isDevelopment()) {
      console.log(formatMessage(LogLevel.INFO, message, meta));
    }
  },

  debug(message, meta = {}) {
    if (isDevelopment()) {
      console.log(formatMessage(LogLevel.DEBUG, message, meta));
    }
  }
};

export function logRequest(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel](`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  });
  
  next();
}
