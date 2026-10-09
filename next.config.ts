import type { NextConfig } from 'next';

// Origins allowed to reach the dev server through a hosted preview proxy.
// The browser loads the app from a preview hostname rather than the host the
// dev server binds to. Next.js currently only warns about those cross-origin
// requests to `/_next/*`, but it will block them in a future major version,
// and Server Actions are rejected outright ("Invalid Server Actions request")
// whenever a proxy forwards an `x-forwarded-host` that differs from `host`.
// Declaring the preview origin covers both. Additional origins can be supplied
// at runtime through a comma-separated ALLOWED_DEV_ORIGINS.
const previewOrigins = [
  '*.lightsprint.ai',
  ...(process.env.ALLOWED_DEV_ORIGINS ?? '').split(',')
]
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: previewOrigins,
  experimental: {
    serverActions: {
      allowedOrigins: previewOrigins
    }
  }
};

export default nextConfig;
