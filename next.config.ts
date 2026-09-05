import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   /* config options here */
   cacheComponents: true,
   allowedDevOrigins: ["shawlless-unregaled-benton.ngrok-free.dev"],
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
