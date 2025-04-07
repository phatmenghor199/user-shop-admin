"use client";

import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  AlertCircle,
  CropIcon,
  ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { BASE_URL_API } from "@/constants/api/route-api";
import {
  compareImageSize,
  convertToBase64,
  getImageType,
  validTypes,
} from "@/utils/images/sore-image";
import { CategoriesModel } from "@/models/dashboard/categories/categories.model";
import {
  getCategoriesByIdService,
  updateCategoriesService,
} from "@/services/dashboard/categories.service";
import Loading from "../../new/loading";

// Define Zod schema for form validation
const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// Type inference from the schema
type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export default function CategoryEditPage() {
  const params = useParams();
  const router = useRouter();
  const [category, setCategory] = useState<CategoriesModel | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3">("1:1");
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with Zod validation
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      status: "ACTIVE",
    },
  });

  // Toggle aspect ratio
  const toggleAspectRatio = () => {
    setAspectRatio((prev) => (prev === "1:1" ? "4:3" : "1:1"));
  };

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getCategoriesByIdService(Number(params.id));
        setCategory(response);

        // Set form values
        form.reset({
          name: response.name,
          status: response.status,
        });

        // Set image preview
        if (response.image && response.image.url) {
          const imageUrl = `${BASE_URL_API}${response.image.url}`;
          setImagePreview(imageUrl);
          setOriginalImageUrl(imageUrl);
        }
      } catch (err) {
        toast.error("Unable to load category information");
        console.error(err);
        router.push("/dashboard/categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [params.id, form, router]);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    const fileType = file.type.toLowerCase();

    if (!validTypes.includes(fileType)) {
      setImageError("Invalid file type. Only JPG, PNG, and WebP are supported");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > compareImageSize) {
      setImageError("Image size exceeds 5MB limit");
      return;
    }

    setImageFile(file);
    setImageError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Reset image to original
  const resetImage = () => {
    setImagePreview(originalImageUrl);
    setImageFile(null);
    setImageError(null);
  };

  // Handle the form submission
  const onSubmit = async (values: CategoryFormValues) => {
    if (!category) {
      toast.error("Category data not found");
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if an image was uploaded
      if (imageFile) {
        // Handle image upload and category update together
        const base64Image = await convertToBase64(imageFile);
        const imageType = getImageType(imageFile);

        // Update category with new image
        const response = await updateCategoriesService(category.id, {
          ...values,
          image: {
            base64Image: base64Image,
            imageType: imageType,
          },
        });

        if (response) {
          toast.success("Category updated successfully");
          router.push(`/dashboard/categories/${params.id}`);
        } else {
          toast.error("Failed to update category");
        }
      } else {
        // Update category without changing the image
        const response = await updateCategoriesService(category.id, values);

        if (response) {
          toast.success("Category updated successfully");
          router.push(`/dashboard/categories/${params.id}`);
        } else {
          toast.error("Failed to update category");
        }
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!category) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading category data
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/categories/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to category details</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Category</h2>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Category Image</CardTitle>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={toggleAspectRatio}
                className="flex items-center gap-1"
              >
                <CropIcon className="h-4 w-4" />
                {aspectRatio}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                  {imagePreview ? (
                    <div
                      className={`relative ${
                        aspectRatio === "1:1" ? "aspect-square" : "aspect-[4/3]"
                      } w-full overflow-hidden rounded-lg`}
                    >
                      <img
                        src={imagePreview}
                        alt="Category preview"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute right-2 top-2 flex gap-2">
                        {imageFile && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetImage}
                            disabled={isSubmitting}
                            type="button"
                          >
                            Reset
                          </Button>
                        )}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleUploadClick}
                          disabled={isSubmitting}
                          type="button"
                        >
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          No image currently set
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Drag and drop your category image here or click to
                          upload
                        </p>
                      </div>
                      {/* Hidden file input */}
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
                      {/* Visible button that triggers the file input */}
                      <Button
                        variant="secondary"
                        className="gap-2"
                        disabled={isSubmitting}
                        type="button"
                        onClick={handleUploadClick}
                      >
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload Image</span>
                      </Button>
                    </>
                  )}
                </div>

                {imageError && (
                  <div className="rounded-md bg-red-50 p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{imageError}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Image Requirements</h3>
                  <ul className="list-inside list-disc text-sm text-muted-foreground">
                    <li>File formats: JPG, PNG, or WebP</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Recommended aspect ratio: {aspectRatio}</li>
                    <li>
                      Minimum resolution:{" "}
                      {aspectRatio === "1:1" ? "400 x 400" : "400 x 300"} pixels
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name*</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter category name"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter a name for the category (required).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Toggle whether this category is active or inactive.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === "ACTIVE"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "ACTIVE" : "INACTIVE");
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() =>
                      router.push(`/dashboard/categories/${params.id}`)
                    }
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Category"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
