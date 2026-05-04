/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Self-contained build output: emits .next/standalone/server.js with traced node_modules,
  // so the Docker image doesn't need an `npm install` step at runtime.
  output: 'standalone',
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
