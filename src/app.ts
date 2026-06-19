import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createHealthHandler } from './health';
import { createUsersRouter } from './modules/users/users.routes';
import { usersService } from './modules/users/users.service';

export const app = new Hono();

// Stryker disable next-line StringLiteral: Hono treats "" and '*' as equivalent in app.use() — both register the middleware for all routes
app.use('*', cors());

app.get('/api/health', createHealthHandler());
app.route('/api/users', createUsersRouter(usersService));
