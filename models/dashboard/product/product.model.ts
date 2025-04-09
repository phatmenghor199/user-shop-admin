export interface AllProductsResponse {
  content: ProductModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProductModel {
  id: number;
  name: string;
  price: number;
  description: string;
  status: string;
  finalPrice: number;
  promotionStatus: string;
  categoryId: number;
  shopId: number;
  discountType?: string;
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  mainImage?: ImageModel;
  additionalImages: ImageModel[];
  sizes: Size[];
  createdAt: string;
  updatedAt: any;
}

interface ImageModel {
  id: string;
  url: string;
}

export interface Size {
  id: number;
  size: string;
  price: number;
  finalPrice: number;
  promotionStatus: string;
  discountType?: string;
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  status: string;
  productId: number;
  mainImage?: ImageModel;
  additionalImages: ImageModel[];
}
