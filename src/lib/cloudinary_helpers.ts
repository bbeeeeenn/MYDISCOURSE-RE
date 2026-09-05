import "client-only";

export async function uploadToCloudinary(
   file: File,
): Promise<{ secure_url: string; public_id: string }> {
   const formData = new FormData();
   formData.append("file", file);
   formData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET!,
   );

   const res = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData },
   );
   if (!res.ok) throw new Error("Upload failed");
   const data = await res.json();
   return { public_id: data.public_id, secure_url: data.secure_url };
}
