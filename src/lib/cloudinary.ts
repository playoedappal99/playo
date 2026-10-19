import crypto from "crypto";

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || "daqtx9vn";
const API_KEY = process.env.CLOUDINARY_API_KEY || "539834849713961";
const API_SECRET = process.env.CLOUDINARY_API_SECRET || "f_yvGCpOa6cSW6cXkJJtMZdbIQA";

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
  bytes?: number;
}

/**
 * Uploads an image (base64 data URI, raw buffer, or remote URL) to Cloudinary
 */
export async function uploadToCloudinary(
  fileData: string,
  folder: string = "playoedappal"
): Promise<CloudinaryUploadResult> {
  const timestamp = Math.round(new Date().getTime() / 1000);

  // Parameters to sign in alphabetical order
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
  const signature = crypto.createHash("sha1").update(paramsToSign).digest("hex");

  const formData = new FormData();
  formData.append("file", fileData);
  formData.append("api_key", API_KEY);
  formData.append("timestamp", timestamp.toString());
  formData.append("signature", signature);
  formData.append("folder", folder);

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
  };
}
