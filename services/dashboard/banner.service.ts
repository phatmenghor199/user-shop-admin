import { BannerFilterOptions } from "@/models/dashboard/banner/banner-filter.model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllBannerAdminService(param: BannerFilterOptions) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/banner/shop/all`,
      param
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all shop admins:", error);
    return null;
  }
}

export async function getBannerByIdService(id: string) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/banner/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all shop admins:", error);
    return null;
  }
}

export async function createBannerService(data: any) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/banner`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all shop admins:", error);
    return null;
  }
}

interface UpdateBannerModel {
  description?: string;
  imageUrl?: string;
  status?: string;
}
export async function updateBannerService(
  bannerId: number,
  data: UpdateBannerModel
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/banner/${bannerId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all shop admins:", error);
    return null;
  }
}
