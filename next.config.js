/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://investment-agent-449502745670.europe-west1.run.app',
  },
}

module.exports = nextConfig
