import { execSync } from 'child_process';
import { serve } from '@hono/node-server';
import { app } from './app';

execSync('npx prisma migrate deploy', { stdio: 'inherit' });

const port = Number(process.env.PORT) || 3000;

serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);
