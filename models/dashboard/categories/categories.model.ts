export interface CategoriesPaginationModel {
  content: CategoriesModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CategoriesModel {
  id: number;
  name: string;
  image: Image;
  shopId: number;
  status: string;
  createdAt: string;
}

interface Image {
  id: number;
  url: string;
}
