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
import {
  getAllBannerAdminService,
  updateBannerService,
} from "@/services/dashboard/banner.service";
import { BANNER_STATUS, STATUS_OPTIONS } from "../../../constants/enum/status";
// import { toast } from "sonner";
import {
  BannerModel,
  BannerPaginationModel,
} from "@/models/dashboard/banner/banner.model";
import Laoding from "@/components/shared/loading/laoding";
import PaginationPage from "@/components/shared/pagination/pagination-page";
import { BASE_URL_API } from "@/constants/api/route-api";
import { bannerAdminTableHeader } from "@/constants/tables/banner";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { toast } from "sonner";
import ConfirmDialog from "@/components/shared/modal/confirm-action";

export function BannersTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerData, setBannerData] = useState<BannerPaginationModel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [banner, setBanner] = useState<BannerModel | null>(null);

  // Fetch users with filters
  const loadBanner = useCallback(
    async (param: BannerFilterOptions) => {
      setIsLoading(true);

      const response = await getAllBannerAdminService({
        search: searchQuery,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        ...param,
      });

      if (response) {
        setBannerData(response);
      } else {
        console.error("Failed to fetch users:");
        toast.error("Failed to load users");
      }
      setIsLoading(false);
    },
    [searchQuery, statusFilter]
  );

  useEffect(() => {
    loadBanner({});
  }, [searchQuery, statusFilter, loadBanner]);

  const toggleBannerStatus = async (bannerId: number, status: string) => {
    setBannerData((prevData) => {
      if (!prevData) return null;
      const updatedContent = prevData.content.map((banner) => {
        if (banner.id === bannerId) {
          return {
            ...banner,
            status:
              status === BANNER_STATUS.ACTIVE
                ? BANNER_STATUS.INACTIVE
                : BANNER_STATUS.ACTIVE,
          };
        }
        return banner;
      });

      return {
        ...prevData,
        content: updatedContent,
      };
    });

    const resposne = await updateBannerService(bannerId, {
      status:
        status == BANNER_STATUS.ACTIVE
          ? BANNER_STATUS.INACTIVE
          : BANNER_STATUS.ACTIVE,
    });

    if (resposne) {
      toast.success("Banner status updated successfully");
    } else {
      toast.error("Failed to update banner status");
    }
  };

  async function handleDeleteUser() {}

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search banners..."
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
                  {bannerAdminTableHeader.map((header) => (
                    <TableHead key={header.label} className={header.className}>
                      {header.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {bannerData && bannerData?.totalElements === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No banners found.
                    </TableCell>
                  </TableRow>
                ) : (
                  bannerData?.content.map((banner, index) => {
                    const lineIndex =
                      ((bannerData.pageNo || 1) - 1) * 10 + index + 1;

                    return (
                      <TableRow key={banner.id}>
                        <TableCell className="cell-truncate">
                          {lineIndex}
                        </TableCell>
                        <TableCell>
                          <ImageMe
                            imageUrl={BASE_URL_API + banner.imageUrl}
                            alt={banner.description}
                            className="w-20 h-12 sm:w-24 sm:h-16"
                          />
                        </TableCell>
                        <TableCell className="cell-truncate">
                          {banner.description}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={banner.status === BANNER_STATUS.ACTIVE}
                              onCheckedChange={() =>
                                toggleBannerStatus(banner.id, banner.status)
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
                                <Link href={`/dashboard/banners/${banner.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link
                                  href={`/dashboard/banners/${banner.id}/edit`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  toggleBannerStatus(banner.id, banner.status)
                                }
                              >
                                {banner.status === BANNER_STATUS.ACTIVE ? (
                                  <Power className="mr-2 h-4 w-4 " />
                                ) : (
                                  <Power className="mr-2 h-4 w-4 rotate-180" />
                                )}
                                {banner.status === BANNER_STATUS.ACTIVE
                                  ? "Deactivate"
                                  : "Activate"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {}}
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
        {bannerData && bannerData.totalPages > 1 && (
          <PaginationPage
            currentPage={bannerData.pageNo}
            totalPages={bannerData.totalPages}
            onPageChange={(page: number) => loadBanner({ pageNo: page })}
          />
        )}
      </CardContent>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteUser}
        variant="danger"
        size="md" // or "full" for fullscreen
      />
    </Card>
  );
}
