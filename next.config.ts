import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* config options here */
   cacheComponents: true,
   images: {
      remotePatterns: [
         {
            protocol: "https",
            hostname: "res.cloudinary.com",
         },
      ],
   },
};

export default nextConfig;
