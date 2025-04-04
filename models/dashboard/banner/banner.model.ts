export interface BannerModel {
  id: number;
  description: string;
  imageUrl: string;
  shopId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface BannerPaginationModel {
  content: BannerModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
