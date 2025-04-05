"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, UploadCloud, AlertCircle } from "lucide-react";
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
import Loading from "@/components/shared/loading/laoding";
import { BASE_URL_API } from "@/constants/api/route-api";
import {
  compareImageSize,
  convertToBase64,
  getImageType,
  validTypes,
} from "@/utils/images/sore-image";
import { uploadImageService } from "@/services/setting/image.service";
import { axiosClientWithAuth } from "@/utils/axios";

// Define Zod schema for form validation
const bannerFormSchema = z.object({
  description: z.string().max(500, "Description cannot exceed 500 characters"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

// Type inference from the schema
type BannerFormValues = z.infer<typeof bannerFormSchema>;

// Type for banner details from API
interface BannerModel {
  id: number;
  description: string;
  imageUrl: string;
  status: "ACTIVE" | "INACTIVE";
  shopId?: number;
  createdAt: string;
  updatedAt?: string;
}

const EditBannerPage = () => {
  const params = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for banner details and form
  const [banner, setBanner] = useState<BannerModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Initialize form with Zod validation
  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      description: "",
      status: "ACTIVE",
    },
  });

  // Fetch banner details on component mount
  useEffect(() => {
    const fetchBannerDetails = async () => {
      try {
        setIsLoading(true);
        const response = await axiosClientWithAuth.get(
          `/v1/banner/${params.id}`
        );
        const bannerData = response.data.data;

        // Set form values
        form.reset({
          description: bannerData.description,
          status: bannerData.status,
        });

        // Set initial image preview
        setImagePreview(BASE_URL_API + bannerData.imageUrl);

        setBanner(bannerData);
      } catch (err) {
        toast.error("Failed to fetch banner details");
        console.error(err);
        router.push("/dashboard/banners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerDetails();
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

  // Handle form submission
  const onSubmit = async (values: BannerFormValues) => {
    if (!banner) return;

    try {
      setIsSubmitting(true);

      let imageUrl = banner.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        const base64Image = await convertToBase64(imageFile);
        const imageType = getImageType(imageFile);

        const imageResponse = await uploadImageService({
          base64Image: base64Image,
          imageType: imageType,
        });

        if (!imageResponse) {
          toast.error("Failed to upload image");
          return;
        }

        imageUrl = imageResponse.url;
      }

      // Update banner
      const updateResponse = await axiosClientWithAuth.put(
        `/v1/banner/${banner.id}`,
        {
          description: values.description,
          imageUrl: imageUrl,
          status: values.status,
        }
      );

      if (updateResponse.data) {
        toast.success("Banner updated successfully");
        router.push("/dashboard/banners");
      } else {
        toast.error("Failed to update banner");
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error("An error occurred during submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <Loading />;
  }

  // Error state
  if (!banner) {
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
          <h2 className="text-3xl font-bold tracking-tight">Edit Banner</h2>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Banner Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                  {imagePreview ? (
                    <div className="relative aspect-[2/1] w-full overflow-hidden rounded-lg">
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
                          Recommended size: 1200 x 600 pixels (2:1 ratio)
                        </p>
                      </div>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
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
                    <li>Recommended aspect ratio: 2:1</li>
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
                          Make this banner active or inactive.
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
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Updating..." : "Update Banner"}
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

export default EditBannerPage;
