type Meta = Record<string, unknown>;

function print(level: 'INFO' | 'ERROR' | 'WARN', message: string, meta?: Meta): void {
  const time = new Date().toISOString();
  if (meta) {
    console.log(`[${time}] [${level}] ${message}`, meta);
    return;
  }
  console.log(`[${time}] [${level}] ${message}`);
}

export const logger = {
  info: (message: string, meta?: Meta) => print('INFO', message, meta),
  warn: (message: string, meta?: Meta) => print('WARN', message, meta),
  error: (message: string, meta?: Meta) => print('ERROR', message, meta)
};
