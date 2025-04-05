"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ImageIcon,
  UploadCloud,
  AlertCircle,
  CheckCircle2,
  CropIcon,
} from "lucide-react";
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
import { createBannerService } from "@/services/dashboard/banner.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define Zod schema for form validation
const bannerFormSchema = z.object({
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// Type inference from the schema
type BannerFormValues = z.infer<typeof bannerFormSchema>;

// Default values
const defaultValues: Partial<BannerFormValues> = {
  description: "",
  status: "ACTIVE",
};

const ImageUploadAndBannerSubmission = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<"2:1" | "3:1">("2:1");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Initialize form with Zod validation
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues,
  });

  // Toggle aspect ratio
  const toggleAspectRatio = () => {
    setAspectRatio((prev) => (prev === "2:1" ? "3:1" : "2:1"));
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
    // This is the only place we should trigger the file input click
    fileInputRef.current?.click();
  };

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Add a visual cue that the area is droppable
    e.currentTarget.classList.add("border-primary");
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove the visual cue
    e.currentTarget.classList.remove("border-primary");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Remove the visual cue
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
  const onSubmit = async (values: BannerFormValues) => {
    // Validate image
    if (!imageFile) {
      setImageError("Please select an image first");
      return;
    }

    try {
      setIsSubmitting(true);

      // Show loading toast
      const loadingToast = toast.loading("Uploading image...");

      const base64Image = await convertToBase64(imageFile);
      const imageType = getImageType(imageFile);

      // Upload the image first
      const imageResponse = await uploadImageService({
        base64Image: base64Image,
        imageType: imageType,
      });

      if (!imageResponse) {
        toast.dismiss(loadingToast);
        toast.error("Failed to upload image");
        setImageError("Image upload failed");
        return;
      }

      // Update toast
      toast.dismiss(loadingToast);
      toast.loading("Creating banner...");

      // Then create the banner with the image URL
      const bannerResponse = await createBannerService({
        description: values.description,
        imageUrl: imageResponse.url,
        status: values.status,
      });

      if (!bannerResponse) {
        toast.error("Failed to create banner");
        setImageError("Banner creation failed");
        return;
      }

      // Success!
      toast.dismiss();
      toast.success("Banner created successfully");

      // Reset and redirect
      resetForm();
      router.push("/dashboard/banners");
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
        <h2 className="text-3xl font-bold tracking-tight">Create Banner</h2>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Banner Image</CardTitle>
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
                        aspectRatio === "2:1" ? "aspect-[2/1]" : "aspect-[3/1]"
                      } w-full overflow-hidden rounded-lg`}
                    >
                      <img
                        src={imagePreview}
                        alt="Banner preview"
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
                          Drag and drop your banner image here
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Recommended size:{" "}
                          {aspectRatio === "2:1" ? "1200 x 600" : "1200 x 400"}{" "}
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
                    <li>Minimum width: 1200 pixels</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Banner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter banner description"
                          className="resize-none min-h-24"
                          disabled={isSubmitting}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Provide a brief description of the banner (optional).
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
                          Make this banner active immediately after creation.
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
                    onClick={() => router.push("/dashboard/banners")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!imageFile || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Create Banner"}
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

export default ImageUploadAndBannerSubmission;
