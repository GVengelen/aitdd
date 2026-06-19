import type { Context } from 'hono';
import { formatUptime } from './utils/uptime';
import pkg from '../package.json';

export type HealthDeps = {
  isHealthy: () => boolean;
  getUptime: () => number;
  getVersion: () => string | undefined;
};

const defaults: HealthDeps = {
  isHealthy: () => true,
  getUptime: () => process.uptime(),
  getVersion: () => pkg.version,
};

export function createHealthHandler(deps: Partial<HealthDeps> = {}) {
  const { isHealthy, getUptime, getVersion } = { ...defaults, ...deps };

  return (c: Context) => {
    const uptimeSeconds = Math.floor(getUptime());
    const healthy = isHealthy();

    const body = {
      status: healthy ? 'ok' : 'degraded',
      uptime: {
        seconds: uptimeSeconds,
        human: formatUptime(uptimeSeconds),
      },
      version: getVersion() ?? 'unknown',
      environment: process.env.NODE_ENV ?? 'development',
      nodeVersion: process.version,
    };

    return c.json(body, healthy ? 200 : 503);
  };
}
