/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['justfields.com'],
  },
  env: {
    JSON_URL: process.env.JSON_URL,
  },
}

module.exports = nextConfig
