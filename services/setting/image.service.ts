import { axiosClient } from "@/utils/axios";

interface uploadImageModel {
  base64Image: string;
  imageType: string;
}
export async function uploadImageService(data: uploadImageModel) {
  try {
    const response = await axiosClient.post(`/v1/images`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error uploading image:", error);
    return null;
  }
}
