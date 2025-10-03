/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pastikan path sesuai dengan lokasi kontenmu
  outputFileTracingIncludes: {
    '*': ['./content/articles/**'],
  },

  // Kompilasi untuk browser yang lebih tua, termasuk Safari
  transpilePackages: [],
  
  // Konfigurasi Webpack untuk polyfill dan browser lama
  webpack: (config, { isServer, dev }) => {
    // Hanya untuk build client-side (browser)
    if (!isServer) {
      // Gunakan polyfills untuk browser lama
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  
  // (Opsional, biar build tidak gagal karena linting)
  // eslint: { ignoreDuringBuilds: true },
  
  // Opsi eksperimental untuk meningkatkan kompatibilitas
  experimental: {
    // Opsi yang dapat membantu Safari
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
