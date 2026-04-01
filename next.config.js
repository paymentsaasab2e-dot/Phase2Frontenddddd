/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev }) => {
    // Avoid huge webpack disk cache (fixes ENOSPC on full disks during `next dev` / build)
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

module.exports = nextConfig;
