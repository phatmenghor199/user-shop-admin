import { CreateProductModel } from "@/models/dashboard/product/create-product.model";
import { axiosClientWithAuth } from "@/utils/axios";

export async function createProductService(data: CreateProductModel) {
  try {
    const response = await axiosClientWithAuth.post(`/v1/product`, data);
    return response.data.data;
  } catch (error: any) {
    console.error("Error creating product:", error);
    return null;
  }
}

export interface FilterProductParams {
  search?: string;
  status?: string;
  categoryId?: number;
  hasPromotion?: boolean;
  pageNo?: number;
  pageSize?: number;
}

export async function getAllProductAdminService(param: FilterProductParams) {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/shop/all`,
      param
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching all products:", error);
    return null;
  }
}

// Get product by ID
export const getProductByIdService = async (id: number) => {
  try {
    const response = await axiosClientWithAuth.get(`/v1/product/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
};

// Remove a size from a product
export const removeProductSizeService = async (
  productId: number,
  sizeId: number
) => {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/product/${productId}/sizes/${sizeId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error removing product size:", error);
    return null;
  }
};

export async function updateProductAdminService(
  productId: number,
  data: CreateProductModel
) {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/product/${productId}`,
      data
    );
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating product:", error);
    return null;
  }
}

export const deleteProductAdminService = async (id: number) => {
  try {
    const resposne = await axiosClientWithAuth.delete(`/v1/product/${id}`);
    return resposne.data.data;
  } catch (err) {
    console.error("Error deleting product:", err);
    return null;
  }
};
