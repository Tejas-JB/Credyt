/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Configure image domains if needed
  images: {
    domains: ['images.unsplash.com'],
  },
};

module.exports = nextConfig; 