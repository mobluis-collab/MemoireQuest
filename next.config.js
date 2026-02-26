/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Désactive le cache disque webpack en dev pour éviter les corruptions de .next
      config.cache = false
    }
    return config
  },
  // Optimisations production
  poweredByHeader: false,
  compress: true,
  // Performance monitoring
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;
