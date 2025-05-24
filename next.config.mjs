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
}

export default nextConfig
