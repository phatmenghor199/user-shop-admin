"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { axiosClientWithAuth } from "@/utils/axios";
import ImageMe from "@/components/shared/images/image_me";
import { BASE_URL_API } from "@/constants/api/route-api";
import { deleteBannerService } from "@/services/dashboard/banner.service";
import ConfirmDialog from "@/components/shared/modal/confirm-action";
import { BannerModel } from "@/models/dashboard/banner/banner.model";
import Laoding from "@/components/shared/loading/laoding";

export default function BannerDetailPage() {
  const params = useParams();
  const [banner, setBanner] = useState<BannerModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBannerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClientWithAuth.get(
          `/v1/banner/${params.id}`
        );
        setBanner(response.data.data);
      } catch (err) {
        setError("Failed to fetch banner details");
        toast.error("Unable to load banner information");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerDetails();
  }, [params.id]);

  const handleDeleteBanner = async () => {
    const bannerId = Number(params.id);
    if (isNaN(bannerId)) {
      toast.error("Invalid banner ID");
      return;
    }

    const resposne = await deleteBannerService(bannerId);
    if (resposne) {
      toast.success("Banner deleted successfully");
      router.push("/dashboard/banners");
    } else {
      toast.error("Failed to delete banner");
    }
  };

  if (isLoading) {
    return <Laoding />;
  }

  if (error || !banner) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading banner details
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/banners">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to banners</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Banner Details</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/banners/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Banner
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Banner
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageMe
              imageUrl={BASE_URL_API + banner.imageUrl}
              alt={banner.description}
              className="h-56"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
            <CardDescription>
              Detailed information about this banner.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Banner ID
                </h3>
                <p>{banner.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <p className="text-sm">{banner.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Shop ID
                  </h3>
                  <p>{banner.shopId}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h3>
                  <Badge
                    variant={banner.status === "ACTIVE" ? "default" : "outline"}
                    className="capitalize"
                  >
                    {banner.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Created At
                  </h3>
                  <p>{new Date(banner.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </h3>
                  <p>
                    {banner.updatedAt
                      ? new Date(banner.updatedAt).toLocaleString()
                      : "Not updated yet"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete User"
        description="Are you sure you want to delete this banner? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteBanner}
        variant="danger"
        size="md" // or "full" for fullscreen
      />
    </div>
  );
}
