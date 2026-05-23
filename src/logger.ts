import { config } from './config';

export interface LogEntry {
  timestamp: string;
  level: string;
  label: string;
  message: string;
}

const logBuffer: LogEntry[] = [];

function addToBuffer(entry: LogEntry): void {
  logBuffer.push(entry);
  while (logBuffer.length > config.logBufferSize) {
    logBuffer.shift();
  }
}

export function getLogs(level?: string, limit?: number): LogEntry[] {
  let entries = level
    ? logBuffer.filter((e) => e.level === level)
    : [...logBuffer];
  if (limit) {
    entries = entries.slice(-limit);
  }
  return entries;
}

const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
};

function timestamp(): string {
  return new Date().toISOString();
}

function format(
  level: string,
  color: string,
  message: string,
  label?: string
): string {
  const ts = `${colors.dim}${timestamp()}${colors.reset}`;
  const lvl = `${color}[${level}]${colors.reset}`;
  const lbl = label ? `${colors.bold}[${label}]${colors.reset}: ` : '';
  return `${ts} ${lvl} ${lbl}${message}`;
}

export const logger = {
  info(message: string, label?: string): void {
    const labelStr = label ?? 'Server';
    addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'info',
      label: labelStr,
      message,
    });
    console.log(format('info', colors.green, message, labelStr));
  },
  warn(message: string, label?: string): void {
    const labelStr = label ?? 'Server';
    addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'warn',
      label: labelStr,
      message,
    });
    console.warn(format('warn', colors.yellow, message, labelStr));
  },
  error(message: string, label?: string): void {
    const labelStr = label ?? 'Server';
    addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'error',
      label: labelStr,
      message,
    });
    console.error(format('error', colors.red, message, labelStr));
  },
  debug(message: string, label?: string): void {
    if (!config.debug) return;
    const labelStr = label ?? 'Server';
    addToBuffer({
      timestamp: new Date().toISOString(),
      level: 'debug',
      label: labelStr,
      message,
    });
    console.debug(format('debug', colors.blue, message, labelStr));
  },
};

export function banner(): void {
  console.log(
    `\n${colors.magenta}${colors.bold}  ░▒▓█ ʄʀɨɛռɖǟʀʀ █▓▒░${colors.reset}\n`
  );
  console.log(
    `${colors.dim}  Downloading Service — fetch media from remote libraries${colors.reset}\n`
  );
}

export default logger;
