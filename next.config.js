/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: '/fast-charging', destination: '/', permanent: true },
      { source: '/contact', destination: '/', permanent: true },
      { source: '/submit', destination: '/', permanent: true },
      { source: '/stations', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
