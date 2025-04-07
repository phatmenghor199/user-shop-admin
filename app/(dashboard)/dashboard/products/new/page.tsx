"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, X, Plus, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CategorySelector } from "@/components/dashboard/products/category-selector";
import { toast } from "sonner";

// Define enums matching the backend
enum StatusData {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

// Form schema validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  categoryId: z.string({
    required_error: "Please select a category.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a non-negative number.",
  }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional().nullable(),
  discountValue: z.coerce.number().optional().nullable(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ImageData {
  base64Image: string;
  imageType: string;
  preview: string;
}

export default function CreateProductPage() {
  const [mainImage, setMainImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      status: StatusData.ACTIVE,
      discountType: null,
      discountValue: null,
      discountStartDate: null,
      discountEndDate: null,
    },
  });

  // Handle main image upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type.toLowerCase();
    if (
      !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(fileType)
    ) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should not exceed 5MB");
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Get base64 data without prefix
        const base64 = reader.result.split(",")[1];
        const imageType = file.type.split("/")[1];

        setMainImage({
          base64Image: base64,
          imageType: imageType,
          preview: reader.result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle additional images upload
  const handleAdditionalImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (additionalImages.length + files.length > 5) {
      toast.error("You can only upload a maximum of 5 additional images");
      return;
    }

    // Process each file
    Array.from(files).forEach((file) => {
      // Validate file type
      const fileType = file.type.toLowerCase();
      if (
        !["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          fileType
        )
      ) {
        toast.error(`${file.name}: Only JPG, PNG, and WebP images are allowed`);
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name}: Image size should not exceed 5MB`);
        return;
      }

      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          // Get base64 data without prefix
          const base64 = reader.result.split(",")[1];
          const imageType = file.type.split("/")[1];

          setAdditionalImages((prev) => [
            ...prev,
            {
              base64Image: base64,
              imageType: imageType,
              preview: reader.result,
            },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input to allow selecting the same files again
    e.target.value = "";
  };

  // Handle removing an additional image
  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages((images) => images.filter((_, i) => i !== index));
  };

  // Handle removing the main image
  const handleRemoveMainImage = () => {
    setMainImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Validate main image
      if (!mainImage) {
        toast.error("Please upload a main product image");
        setIsLoading(false);
        return;
      }

      // Validate category selection
      if (!values.categoryId) {
        toast.error("Please select a category for the product");
        setIsLoading(false);
        return;
      }

      // Prepare the request payload
      const productData = {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: parseInt(values.categoryId),
        status: values.status,
        image: mainImage,
        additionalImages:
          additionalImages.length > 0 ? additionalImages : undefined,
      };

      // Add discount fields if both type and value are provided
      if (values.discountType && values.discountValue !== null) {
        Object.assign(productData, {
          discountType: values.discountType,
          discountValue: values.discountValue,
        });

        // Add date range only if both dates are provided
        if (values.discountStartDate && values.discountEndDate) {
          Object.assign(productData, {
            discountStartDate: values.discountStartDate,
            discountEndDate: values.discountEndDate,
          });
        }
      }

      console.log("Submitting product data:", productData);

      // Send the request to the backend
      const response = await fetch("/api/v1/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      toast.success("Product created successfully");

      // Redirect to products list page
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to products</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Add New Product</h2>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 md:grid-cols-12">
            {/* Main product information */}
            <Card className="md:col-span-8">
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Enter the basic information of your product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter product name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <CategorySelector
                          value={field.value}
                          onChange={field.onChange}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description*</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter product description"
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status*</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={StatusData.ACTIVE}>
                                Active
                              </SelectItem>
                              <SelectItem value={StatusData.INACTIVE}>
                                Inactive
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-4">
                    <h3 className="text-base font-medium">
                      Discount Settings (Optional)
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select discount type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="PERCENTAGE">
                                  Percentage (%)
                                </SelectItem>
                                <SelectItem value="FIXED_AMOUNT">
                                  Fixed Amount ($)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step={
                                  form.watch("discountType") === "PERCENTAGE"
                                    ? "1"
                                    : "0.01"
                                }
                                placeholder="0"
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) =>
                                  field.onChange(
                                    e.target.value
                                      ? Number(e.target.value)
                                      : null
                                  )
                                }
                                disabled={!form.watch("discountType")}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="discountStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                disabled={
                                  !form.watch("discountType") ||
                                  !form.watch("discountValue")
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="discountEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                disabled={
                                  !form.watch("discountType") ||
                                  !form.watch("discountValue")
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <div className="md:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Main Product Image*</CardTitle>
                  <CardDescription>
                    Square image (1:1 ratio) recommended
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center">
                      {mainImage ? (
                        <div className="relative aspect-square w-full overflow-hidden rounded-md border border-border">
                          <Image
                            src={mainImage.preview}
                            alt="Main product image"
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full"
                            onClick={handleRemoveMainImage}
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="flex aspect-square w-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                            <div className="rounded-full bg-primary/10 p-4">
                              <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">
                                Upload main image
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Square 1:1 ratio recommended
                              </p>
                            </div>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleMainImageUpload}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Image Requirements
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Square aspect ratio (1:1) recommended</li>
                        <li>• Min resolution: 800×800 pixels</li>
                        <li>• Max file size: 5MB</li>
                        <li>• Formats: JPG, PNG, WebP</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Images</CardTitle>
                  <CardDescription>
                    Add up to 5 additional product images
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {additionalImages.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden rounded-md border border-border"
                        >
                          <Image
                            src={image.preview}
                            alt={`Additional image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-1 top-1 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            type="button"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}

                      {additionalImages.length < 5 && (
                        <div
                          className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() =>
                            additionalFileInputRef.current?.click()
                          }
                        >
                          <Plus className="h-5 w-5 text-muted-foreground" />
                          <input
                            ref={additionalFileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={handleAdditionalImageUpload}
                          />
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-center text-muted-foreground">
                      {additionalImages.length}/5 images
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              asChild
              disabled={isLoading}
            >
              <Link href="/dashboard/products">Cancel</Link>
            </Button>
            <Button type="submit" className="gap-1" disabled={isLoading}>
              <Save className="h-4 w-4" />
              {isLoading ? "Creating..." : "Create Product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
