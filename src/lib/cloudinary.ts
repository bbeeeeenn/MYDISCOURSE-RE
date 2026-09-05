import "server-only";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
   cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function deleteImage(publicId: string) {
   const result = await cloudinary.uploader.destroy(publicId);
   return result; // { result: 'ok' } or { result: 'not found' }
}
