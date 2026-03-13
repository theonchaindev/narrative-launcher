import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@narrative-launcher/shared-types'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'abs.twimg.com' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'cf-ipfs.com' },
      { protocol: 'https', hostname: '*.r2.dev' },
    ],
  },
};

export default nextConfig;
