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
import { BASE_URL_API } from "@/constants/api/route-api";
import ConfirmDialog from "@/components/shared/modal/confirm-action";
import { CategoriesModel } from "@/models/dashboard/categories/categories.model";
import {
  deleteCategoriesService,
  getCategoriesByIdService,
} from "@/services/dashboard/categories.service";
import Loading from "../new/loading";
import ImageMe from "@/components/shared/images/image_me";

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState<CategoriesModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getCategoriesByIdService(Number(params.id));
        setCategory(response);
      } catch (err) {
        setError("Failed to fetch category details");
        toast.error("Unable to load category information");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [params.id]);

  const handleDeleteCategory = async () => {
    const categoryId = Number(params.id);
    if (isNaN(categoryId)) {
      toast.error("Invalid category ID");
      return;
    }

    const response = await deleteCategoriesService(categoryId);
    if (response) {
      toast.success("Category deleted successfully");
      router.push("/dashboard/categories");
    } else {
      toast.error("Failed to delete category");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !category) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading category details
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to categories</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">
            Category Details
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/categories/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Category
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-square w-full h-auto overflow-hidden rounded-md">
              <ImageMe
                imageUrl={BASE_URL_API + category.image.url}
                alt={category.name}
                className="h-full w-full object-cover"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>
              Detailed information about this category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Category ID
                </h3>
                <p>{category.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Name
                </h3>
                <p className="font-medium">{category.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Shop ID
                  </h3>
                  <p>{category.shopId}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Status
                  </h3>
                  <Badge
                    variant={
                      category.status === "ACTIVE" ? "default" : "outline"
                    }
                    className="capitalize"
                  >
                    {category.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Created At
                  </h3>
                  <p>{new Date(category.createdAt).toLocaleString()}</p>
                </div>

                {/* <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </h3>
                  <p>
                    {category.updatedAt
                      ? new Date(category.updatedAt).toLocaleString()
                      : "Not updated yet"}
                  </p>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteCategory}
        variant="danger"
        size="md"
      />
    </div>
  );
}
