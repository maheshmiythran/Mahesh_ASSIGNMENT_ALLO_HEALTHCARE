// Logger utility for consistent logging across the application
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private printLog(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    if (entry.level === 'error') {
      console.error(`${prefix} ${entry.message}${contextStr}`);
    } else if (entry.level === 'warn') {
      console.warn(`${prefix} ${entry.message}${contextStr}`);
    } else if (entry.level === 'debug' && this.isDevelopment) {
      console.log(`${prefix} ${entry.message}${contextStr}`);
    } else if (entry.level === 'info') {
      console.log(`${prefix} ${entry.message}${contextStr}`);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.printLog(this.formatLog('info', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.printLog(this.formatLog('warn', message, context));
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.printLog(this.formatLog('error', message, context));
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.printLog(this.formatLog('debug', message, context));
  }
}

export const logger = new Logger();
