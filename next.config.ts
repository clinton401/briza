import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com', "i.redd.it", "cdn.discordapp.com"], // Add Cloudinary's domain
  },
};

export default nextConfig;
