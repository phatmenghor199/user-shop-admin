import { CategoriesFilterOptions } from "@/models/dashboard/categories/categories-filter.model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function getAllCategoriesAdminService(
  param: CategoriesFilterOptions
) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/category/shop/all`,
      param
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all categories admins:", error);
    return null;
  }
}

interface CreateCategoriesModel {
  name?: string;
  image?: {
    base64Image?: string;
    imageType?: string;
  };
  status?: string;
}
export async function createCategoriesService(data: CreateCategoriesModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/category`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating categories:", error);
    return null;
  }
}

export async function getCategoriesByIdService(id: number) {
  try {
    const response = await axiosClientWithAuth.get(`/v1/category/${id}`);
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
}

interface UpdateCategoryModel {
  status?: string;
  name?: string;
  image?: {
    base64Image?: string;
    imageType?: string;
  };
}
export async function updateCategoriesService(
  categoriesId: number,
  data: UpdateCategoryModel
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/category/${categoriesId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating categories:", error);
    return null;
  }
}

export const deleteCategoriesService = async (id: number) => {
  try {
    const resposne = await axiosClientWithAuth.delete(`/v1/category/${id}`);
    return resposne.data.data;
  } catch (err) {
    console.error("Error deleting categories:", err);
    return null;
  }
};
