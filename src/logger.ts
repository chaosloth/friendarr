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
    console.log(format('info', colors.green, message, label));
  },
  warn(message: string, label?: string): void {
    console.warn(format('warn', colors.yellow, message, label));
  },
  error(message: string, label?: string): void {
    console.error(format('error', colors.red, message, label));
  },
  debug(message: string, label?: string): void {
    console.debug(format('debug', colors.blue, message, label));
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
