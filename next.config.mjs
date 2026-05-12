/** @type {import('next').NextConfig} */
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
const basePath = rawBase && !rawBase.startsWith('/') ? `/${rawBase}` : rawBase;

const nextConfig = {
  output: 'standalone',
  basePath,
  async redirects() {
    if (!basePath) return [];
    return [
      {
        source: '/',
        destination: basePath,
        permanent: false,
        basePath: false,
      },
    ];
  },
};

export default nextConfig;
