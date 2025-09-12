// next.config.js (atau next.config.mjs)
const nextConfig = {
  experimental: {
    // Pastikan path glob mengarah ke folder konten kamu
    outputFileTracingIncludes: {
      // berlaku untuk semua route
      '*': ['./content/articles/**'], 
      // kalau kontenmu beda, ganti pathnya
      // '*': ['./data/posts/**'],
    },
  },
};
module.exports = nextConfig;
