export interface CreateProductModel {
  name: string;
  price?: number;
  description?: string;
  categoryId: number;
  status: string;
  discountType?: string;
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  image?: Image;
  additionalImages?: Image[];
  sizes?: Size[];
}

interface Image {
  base64Image?: string;
  imageType?: string;
}

interface Size {
  id?: number;
  size: string;
  price: number;
  discountType?: string;
  discountValue?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  image?: Image;
  additionalImages?: Image[];
  status: string;
}
