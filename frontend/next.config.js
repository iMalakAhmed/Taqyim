/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5273",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
