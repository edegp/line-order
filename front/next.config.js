/** @type {import('next').NextConfig} */
const path = require("path");
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["images.unsplash.com"],
  },
  experimental: {
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "**.bp.blogspot.com",
        },
      ],
    },
  },
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
};

module.exports = nextConfig;
