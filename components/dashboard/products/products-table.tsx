"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  ArrowUpDown,
  X,
  Eye,
  Trash2,
  Power,
  Edit,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ImageMe from "@/components/shared/images/image_me";
import ConfirmDialog from "@/components/shared/modal/confirm-action";
import PaginationPage from "@/components/shared/pagination/pagination-page";
import { toast } from "sonner";
import { BASE_URL_API } from "@/constants/api/route-api";
import {
  AllProductsResponse,
  ProductModel,
} from "@/models/dashboard/product/product.model";
import {
  deleteProductAdminService,
  getAllProductAdminService,
  updateProductAdminService,
} from "@/services/dashboard/product.service";
import { FilterProductParams } from "@/models/dashboard/product/size-update.model";

// Constants
const STATUS_OPTIONS = [
  { value: "ALL", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
];

// Category options for filter - replace with actual categories
const CATEGORY_OPTIONS = [
  { value: 0, label: "All Categories" },
  { value: 1, label: "Electronics" },
  { value: 2, label: "Clothing" },
  { value: 3, label: "Accessories" },
  { value: 4, label: "Home" },
];

export function ProductsTable() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [promotionFilter, setPromotionFilter] = useState<string>("ALL");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productsData, setProductsData] = useState<AllProductsResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [productToDelete, setProductToDelete] = useState<ProductModel | null>(
    null
  );

  // Fetch products with filters
  const loadProducts = useCallback(
    async (params: Partial<FilterProductParams> = {}) => {
      setIsLoading(true);

      const response = await getAllProductAdminService({
        search: searchQuery,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        hasPromotion:
          promotionFilter === "ALL"
            ? undefined
            : promotionFilter === "HAS_PROMOTION",
        ...params,
      });

      console.log("##Products response:", response);

      if (response) {
        setProductsData(response);
      } else {
        toast.error("Failed to load products");
      }
      setIsLoading(false);
    },
    [searchQuery, statusFilter, promotionFilter]
  );

  useEffect(() => {
    loadProducts({});
  }, [searchQuery, statusFilter, promotionFilter, loadProducts]);

  const toggleProductStatus = async (
    productId: number,
    status: string
  ): Promise<void> => {
    // Update UI optimistically
    setProductsData((prevData) => {
      if (!prevData) return null;
      const updatedContent = prevData.content.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
          };
        }
        return product;
      });

      return {
        ...prevData,
        content: updatedContent,
      };
    });

    // Make API call
    const response = await updateProductAdminService(productId, {
      status: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
    });

    if (response) {
      toast.success("Product status updated successfully");
    } else {
      toast.error("Failed to update product status");
      // Revert UI if API call fails
      loadProducts({});
    }
  };

  const handleDeleteProduct = async (): Promise<void> => {
    if (productToDelete) {
      // Update UI optimistically
      setProductsData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== productToDelete.id
        );
        return {
          ...prevData,
          content: updatedContent,
        };
      });
      setIsDeleteDialogOpen(false);

      // Make API call
      const response = await deleteProductAdminService(productToDelete.id);
      if (response) {
        toast.success("Product deleted successfully");
        // Clear selection if the deleted product was selected
        setSelectedProducts((prev) =>
          prev.filter((id) => id !== productToDelete.id)
        );
      } else {
        toast.error("Failed to delete product");
        // Revert UI if API call fails
        loadProducts({});
      }
    }
  };

  const toggleProductSelection = (productId: number): void => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllSelection = (): void => {
    if (productsData && productsData.content) {
      if (selectedProducts.length === productsData.content.length) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(productsData.content.map((product) => product.id));
      }
    }
  };

  // Format currency
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-wrap items-center justify-between border-b p-4 gap-2">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full md:w-[300px]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Promotion Filter */}
            <Select value={promotionFilter} onValueChange={setPromotionFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Promotion Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Products</SelectItem>
                <SelectItem value="HAS_PROMOTION">With Promotion</SelectItem>
                <SelectItem value="NO_PROMOTION">Without Promotion</SelectItem>
              </SelectContent>
            </Select>

            {selectedProducts.length > 0 && (
              <Button variant="outline" size="sm" className="h-9">
                Bulk Actions ({selectedProducts.length})
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="h-60 flex items-center justify-center">
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="w-[120px]">Image</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Product</span>
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Promotion</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Final Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!productsData || productsData.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  productsData.content.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <ImageMe
                          imageUrl={
                            BASE_URL_API + (product.mainImage?.url ?? "")
                          }
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.categoryId}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.promotionStatus === "ACTIVE"
                              ? "secondary"
                              : "outline"
                          }
                          className="capitalize"
                        >
                          {product.promotionStatus === "ACTIVE"
                            ? "Active"
                            : "No Promotion"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatPrice(product.finalPrice)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.status === "ACTIVE" ? "default" : "outline"
                          }
                          className="capitalize"
                        >
                          {product.status.toLowerCase()}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/dashboard/products/${product.id}/edit`}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                toggleProductStatus(product.id, product.status)
                              }
                            >
                              <Power
                                className={`mr-2 h-4 w-4 ${
                                  product.status !== "ACTIVE"
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                              {product.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setProductToDelete(product);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {productsData && productsData.totalPages > 1 && (
          <PaginationPage
            currentPage={productsData.pageNo}
            totalPages={productsData.totalPages}
            onPageChange={(page) => loadProducts({ pageNo: page })}
          />
        )}
      </CardContent>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteProduct}
        variant="danger"
        size="md"
      />
    </Card>
  );
}
