import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  webpack(config) {
    const visit = (rules: unknown[]) => {
      for (const rule of rules) {
        if (!rule || typeof rule !== 'object') continue;
        const entry = rule as { oneOf?: unknown[]; rules?: unknown[]; use?: unknown[] };
        if (Array.isArray(entry.oneOf)) visit(entry.oneOf);
        if (Array.isArray(entry.rules)) visit(entry.rules);
        if (Array.isArray(entry.use) && entry.use.some((item) =>
          item !== null && typeof item === 'object' && 'loader' in item &&
          typeof item.loader === 'string' && item.loader.includes('/css-loader/')
        )) entry.use.push({ loader: '@tailwindcss/turbopack' });
      }
    };
    visit(config.module.rules);
    return config;
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
