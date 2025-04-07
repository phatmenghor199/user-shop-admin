"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, X, Eye, Edit, Trash2, Power } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
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
import { Switch } from "@/components/ui/switch";
import ImageMe from "@/components/shared/images/image_me";
import { BannerFilterOptions } from "@/models/dashboard/banner/banner-filter.model";
import { DATA_STATUS, STATUS_OPTIONS } from "../../../constants/enum/status";
import Laoding from "@/components/shared/loading/laoding";
import PaginationPage from "@/components/shared/pagination/pagination-page";
import { BASE_URL_API } from "@/constants/api/route-api";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { toast } from "sonner";
import ConfirmDialog from "@/components/shared/modal/confirm-action";
import { categoryAdminTableHeader } from "@/constants/tables/categories";
import {
  deleteCategoriesService,
  getAllCategoriesAdminService,
  updateCategoriesService,
} from "@/services/dashboard/categories.service";
import { Constants } from "@/constants/key/constant";
import {
  CategoriesModel,
  CategoriesPaginationModel,
} from "@/models/dashboard/categories/categories.model";

export function CategoriesTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesData, setCategoriesData] =
    useState<CategoriesPaginationModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<CategoriesModel | null>(null);

  // Fetch users with filters
  const loadCategories = useCallback(
    async (param: BannerFilterOptions) => {
      setIsLoading(true);

      const response = await getAllCategoriesAdminService({
        search: searchQuery,
        status: statusFilter === Constants.ALL ? undefined : statusFilter,
        ...param,
      });

      if (response) {
        setCategoriesData(response);
      } else {
        console.error("Failed to fetch categories:");
        toast.error("Failed to load categories");
      }
      setIsLoading(false);
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    loadCategories({});
  }, [searchQuery, statusFilter, loadCategories]);

  const toggleCategoriesStatus = async (bannerId: number, status: string) => {
    setCategoriesData((prevData) => {
      if (!prevData) return null;
      const updatedContent = prevData.content.map((banner) => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            status:
              status === DATA_STATUS.ACTIVE
                ? DATA_STATUS.INACTIVE
                : DATA_STATUS.ACTIVE,
          };
        }
        return banner;
      });

      return {
        ...prevData,
        content: updatedContent,
      };
    });

    const resposne = await updateCategoriesService(bannerId, {
      status:
        status == DATA_STATUS.ACTIVE
          ? DATA_STATUS.INACTIVE
          : DATA_STATUS.ACTIVE,
    });

    if (resposne) {
      toast.success("Categories status updated successfully");
    } else {
      toast.error("Failed to update Categories status");
    }
  };

  async function handleDeleteCategories() {
    if (categories) {
      setCategoriesData((prevData) => {
        if (!prevData) return null;
        const updatedContent = prevData.content.filter(
          (item) => item.id !== categories.id
        );
        return {
          ...prevData,
          content: updatedContent,
        };
      });
      setIsDeleteDialogOpen(false);

      const resposne = await deleteCategoriesService(categories.id);
      if (resposne) {
        toast.success("Categories deleted successfully");
      } else {
        toast.error("Failed to delete Categories");
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search Categories..."
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="User Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <Laoding />
        ) : (
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {categoryAdminTableHeader.map((header) => (
                    <TableHead key={header.label} className={header.className}>
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesData && categoriesData?.totalElements === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                ) : (
                  categoriesData?.content.map((banner, index) => {
                    const lineIndex =
                      ((categoriesData.pageNo || 1) - 1) * 10 + index + 1;

                    return (
                      <TableRow key={banner.id}>
                        <TableCell className="cell-truncate">
                          {lineIndex}
                        </TableCell>
                        <TableCell>
                          <ImageMe
                            imageUrl={BASE_URL_API + banner.image.url}
                            alt={banner.name}
                            className="w-12 h-12 sm:w-16 sm:h-16"
                          />
                        </TableCell>

                        <TableCell className="cell-truncate">
                          {banner.name}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={banner.status === DATA_STATUS.ACTIVE}
                              onCheckedChange={() =>
                                toggleCategoriesStatus(banner.id, banner.status)
                              }
                            />

                            <Badge
                              variant={
                                banner.status === "active"
                                  ? "default"
                                  : banner.status === "scheduled"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="capitalize truncate"
                            >
                              {banner.status}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="cell-truncate">
                          {DateTimeFormat(banner.createdAt)}
                        </TableCell>

                        <TableCell className="text-right max-w-[80px]">
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
                                <Link
                                  href={`/dashboard/categories/${banner.id}`}
                                >
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/categories/${banner.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleCategoriesStatus(
                                    banner.id,
                                    banner.status
                                  )
                                }
                              >
                                {banner.status === DATA_STATUS.ACTIVE ? (
                                  <Power className="mr-2 h-4 w-4 " />
                                ) : (
                                  <Power className="mr-2 h-4 w-4 rotate-180" />
                                )}
                                {banner.status === DATA_STATUS.ACTIVE
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setIsDeleteDialogOpen(true);
                                  setCategories(banner);
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
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {categoriesData && categoriesData.totalPages > 1 && (
          <PaginationPage
            currentPage={categoriesData.pageNo}
            totalPages={categoriesData.totalPages}
            onPageChange={(page: number) => loadCategories({ pageNo: page })}
          />
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Categories"
        description="Are you sure you want to delete this Categories? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteCategories}
        variant="danger"
        size="md"
      />
    </Card>
  );
}
