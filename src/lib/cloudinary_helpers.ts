import "client-only";

export async function uploadToCloudinary(file: File): Promise<string> {
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
   console.log(res);
   if (!res.ok) throw new Error("Upload failed");
   const data = await res.json();
   console.log(data);
   return data.secure_url;
}
