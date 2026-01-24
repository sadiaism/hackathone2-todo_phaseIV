/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Important: Enable path aliases for both server and client builds
    config.resolve.modules.push(__dirname);
    return config;
  },
};

module.exports = nextConfig;