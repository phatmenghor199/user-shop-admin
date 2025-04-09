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
