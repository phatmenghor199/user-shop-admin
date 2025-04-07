"use client";

import React, { useState, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, UploadCloud, AlertCircle, CropIcon } from "lucide-react";
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
import {
  compareImageSize,
  convertToBase64,
  getImageType,
  validTypes,
} from "@/utils/images/sore-image";
import { uploadImageService } from "@/services/setting/image.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createCategoriesService } from "@/services/dashboard/categories.service";

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

// Default values
const defaultValues: Partial<CategoryFormValues> = {
  name: "",
  status: "ACTIVE",
};

const CategoryUploadComponent = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:3">("1:1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize form with Zod validation
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues,
  });

  // Toggle aspect ratio
  const toggleAspectRatio = () => {
    setAspectRatio((prev) => (prev === "1:1" ? "4:3" : "1:1"));
  };

  // Handle image file selection (just for preview)
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

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove("border-primary");

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];

      // Check file type
      const fileType = file.type.toLowerCase();

      if (!validTypes.includes(fileType)) {
        setImageError(
          "Invalid file type. Only JPG, PNG, and WebP are supported"
        );
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
    }
  };

  // Handle the full submission process
  const onSubmit = async (values: CategoryFormValues) => {
    // Validate image
    if (!imageFile) {
      setImageError("Please select an image first");
      return;
    }

    try {
      setIsSubmitting(true);

      const base64Image = await convertToBase64(imageFile);
      const imageType = getImageType(imageFile);

      // Update toast
      toast.loading("Creating category...");

      const categoryResponse = await createCategoriesService({
        name: values.name,
        image: {
          base64Image,
          imageType,
        },
        status: values.status,
      });

      if (!categoryResponse) {
        toast.error("Failed to create category");
        setImageError("Category creation failed");
        return;
      }

      // Success!
      toast.dismiss();
      toast.success("Category created successfully");

      // Reset and redirect
      resetForm();
      router.push("/dashboard/categories");
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
    form.reset(defaultValues);
    setImageError(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Category</h2>
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
                <div
                  className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 transition-colors duration-200"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
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
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute right-2 top-2"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setImageError(null);
                        }}
                        disabled={isSubmitting}
                        type="button"
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                        <ImageIcon className="h-10 w-10 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">
                          Drag and drop your category image here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended size:{" "}
                          {aspectRatio === "1:1" ? "400 x 400" : "400 x 300"}{" "}
                          pixels ({aspectRatio} ratio)
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
                          Make this category active immediately after creation.
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
                    onClick={() => router.push("/dashboard/categories")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!imageFile || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Create Category"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default CategoryUploadComponent;
