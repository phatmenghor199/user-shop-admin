export interface SizeUpdateModel {
  size: string;
  price: number;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  image?: {
    base64Image: string;
    imageType: string;
  };
  additionalImages?: {
    base64Image: string;
    imageType: string;
  }[];
}

// Model for creating a new product
export interface CreateProductModel {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  status: "ACTIVE" | "INACTIVE";
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
}

// Interface for size variant form values
export interface SizeFormValues {
  id?: number;
  size: string;
  price: number;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  mainImage?: {
    id?: string;
    base64Image?: string;
    imageType?: string;
    preview: string;
    url?: string;
    isExisting?: boolean;
  } | null;
  additionalImages: {
    id?: string;
    base64Image?: string;
    imageType?: string;
    preview: string;
    url?: string;
    isExisting?: boolean;
  }[];
  isNew?: boolean;
  removedAdditionalImageIds?: string[];
}

export interface FilterProductParams {
  search?: string;
  status?: string;
  categoryId?: number;
  hasPromotion?: boolean;
  pageNo?: number;
  pageSize?: number;
}
