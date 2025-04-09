import { CreateProductModel } from "@/models/dashboard/product/create-product.model";
import {
  FilterProductParams,
  SizeUpdateModel,
} from "@/models/dashboard/product/size-update.model";
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
    return response.data.data;
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

// Updated to support adding multiple sizes
export const addProductSizeService = async (
  productId: number,
  sizes: SizeUpdateModel[]
) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/${productId}/sizes`,
      sizes
    );
    return response.data;
  } catch (error) {
    console.error("Error adding product sizes:", error);
    return null;
  }
};

// Existing single size method for backward compatibility
export const addSingleProductSizeService = async (
  productId: number,
  sizeData: SizeUpdateModel
) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/${productId}/sizes`,
      [sizeData]
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding product size:", error);
    return null;
  }
};

// Update an existing size
export const updateProductSizeService = async (
  productId: number,
  sizeId: number,
  sizeData: SizeUpdateModel
) => {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/product/${productId}/sizes/${sizeId}`,
      sizeData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating product size:", error);
    return null;
  }
};

// Product main image operations
export const updateProductMainImageService = async (
  productId: number,
  imageData: { base64Image: string; imageType: string }
) => {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/product/${productId}/image`,
      imageData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating product main image:", error);
    return null;
  }
};

export const addProductAdditionalImagesService = async (
  productId: number,
  imagesData: { base64Image: string; imageType: string }[]
) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/${productId}/images`,
      imagesData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding product additional images:", error);
    return null;
  }
};

export const removeProductAdditionalImageService = async (
  productId: number,
  imageId: string
) => {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/product/${productId}/images/${imageId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error removing product additional image:", error);
    return null;
  }
};

// Product size image operations
export const updateProductSizeMainImageService = async (
  productId: number,
  sizeId: number,
  imageData: { base64Image: string; imageType: string }
) => {
  try {
    const response = await axiosClientWithAuth.put(
      `/v1/product/${productId}/sizes/${sizeId}/image`,
      imageData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error updating product size main image:", error);
    return null;
  }
};

export const addProductSizeAdditionalImagesService = async (
  productId: number,
  sizeId: number,
  imagesData: { base64Image: string; imageType: string }[]
) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/${productId}/sizes/${sizeId}/images`,
      imagesData
    );
    return response.data.data;
  } catch (error) {
    console.error("Error adding product size additional images:", error);
    return null;
  }
};

export const removeProductSizeAdditionalImageService = async (
  productId: number,
  sizeId: number,
  imageId: string
) => {
  try {
    const response = await axiosClientWithAuth.delete(
      `/v1/product/${productId}/sizes/${sizeId}/images/${imageId}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error removing product size additional image:", error);
    return null;
  }
};

// Reset product discount/promotion
export const resetProductDiscountService = async (productId: number) => {
  try {
    const response = await axiosClientWithAuth.post(
      `/v1/product/${productId}/reset-discount`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error resetting product discount:", error);
    return null;
  }
};
