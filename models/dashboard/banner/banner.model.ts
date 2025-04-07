export interface BannerModel {
  id: number;
  description: string;
  image: Image;
  shopId: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Image {
  id: number;
  url: string;
}

export interface BannerPaginationModel {
  content: BannerModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
