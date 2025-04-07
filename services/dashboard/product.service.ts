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
