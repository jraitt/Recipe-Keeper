import http from 'http';
import { IncomingMessage } from 'http';

const options = {
  hostname: 'localhost',
  port: Number(process.env.PORT) || 3021,
  path: '/api/health',
  method: 'GET' as const,
  timeout: 2000,
};

const request = http.request(options, (res: IncomingMessage) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', () => {
  process.exit(1);
});

request.on('timeout', () => {
  request.destroy();
  process.exit(1);
});

request.end();