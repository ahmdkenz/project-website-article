/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pastikan path sesuai dengan lokasi kontenmu
  outputFileTracingIncludes: {
    '*': ['./content/articles/**'],
  },

  // (Opsional, biar build tidak gagal karena linting)
  // eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
