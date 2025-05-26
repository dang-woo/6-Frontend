/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img-api.neople.co.kr',
        port: '',
        pathname: '/df/items/**',
      },
      {
        protocol: 'https',
        hostname: 'img-api.neople.co.kr',
        port: '',
        pathname: '/df/servers/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: ['http://localhost:3000', 'http://210.99.35.145'],
  },
  webpack: (config) => {
    return config
  },
}

export default nextConfig
