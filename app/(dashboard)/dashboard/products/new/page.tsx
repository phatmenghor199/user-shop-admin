"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, X, Plus, Trash, Check } from "lucide-react";

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
import { createProductService } from "@/services/dashboard/product.service";

// Define enums matching the backend
const StatusData = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

// Form schema
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
  discountType: z
    .enum(["PERCENTAGE", "FIXED_AMOUNT", "NONE"])
    .optional()
    .nullable(),
  discountValue: z.coerce.number().optional().nullable(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),
  hasSizeVariants: z.boolean().default(false),
});

// Define types
type FormValues = z.infer<typeof formSchema>;

interface ImageData {
  base64Image: string;
  imageType: string;
  preview: string;
}

interface SizeVariant {
  id?: number;
  size: string;
  price: number;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  mainImage: ImageData | null;
  additionalImages: ImageData[];
}

export default function CreateProductPage() {
  const [mainImage, setMainImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form
  const form = useForm({
    resolver: zodResolver(formSchema) as any,
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
      hasSizeVariants: false,
    } as FormValues,
  });

  // Watch for sizeVariants toggle
  const hasSizeVariants = form.watch("hasSizeVariants");

  // Add default size variant when size variants are enabled
  useEffect(() => {
    if (hasSizeVariants && sizeVariants.length === 0) {
      addSizeVariant();
    }
  }, [hasSizeVariants, sizeVariants.length]);

  // Add a new size variant
  const addSizeVariant = () => {
    const currentPrice = form.getValues("price");
    setSizeVariants([
      ...sizeVariants,
      {
        size: sizeVariants.length === 0 ? "Default" : "",
        price: currentPrice > 0 ? currentPrice : 0,
        status: StatusData.ACTIVE,
        discountType: null,
        discountValue: null,
        discountStartDate: null,
        discountEndDate: null,
        mainImage: null,
        additionalImages: [],
      },
    ]);
  };

  // Remove a size variant
  const removeSizeVariant = (index: number) => {
    setSizeVariants(sizeVariants.filter((_, i) => i !== index));
  };

  // Update a size variant
  const updateSizeVariant = (
    index: number,
    field: keyof SizeVariant,
    value: any
  ) => {
    const updatedVariants = [...sizeVariants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setSizeVariants(updatedVariants);
  };

  // Handle size variant main image upload
  const handleSizeVariantMainImageUpload = (
    index: number,
    imageData: ImageData | null
  ) => {
    const updatedVariants = [...sizeVariants];
    updatedVariants[index].mainImage = imageData;
    setSizeVariants(updatedVariants);
  };

  // Handle size variant additional image upload
  const handleSizeVariantAdditionalImageUpload = (
    variantIndex: number,
    imageData: ImageData
  ) => {
    const updatedVariants = [...sizeVariants];
    if (updatedVariants[variantIndex].additionalImages.length < 3) {
      updatedVariants[variantIndex].additionalImages = [
        ...updatedVariants[variantIndex].additionalImages,
        imageData,
      ];
      setSizeVariants(updatedVariants);
    } else {
      toast.error("Maximum 3 additional images per size variant");
    }
  };

  // Handle size variant additional image removal
  const handleSizeVariantAdditionalImageRemove = (
    variantIndex: number,
    imageIndex: number
  ) => {
    const updatedVariants = [...sizeVariants];
    updatedVariants[variantIndex].additionalImages = updatedVariants[
      variantIndex
    ].additionalImages.filter((_, i) => i !== imageIndex);
    setSizeVariants(updatedVariants);
  };

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

  // Fixed image upload handler with explicit type casting
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

          // Use explicit casting to ensure TypeScript understands the types
          const newImage: ImageData = {
            base64Image: base64,
            imageType: imageType,
            preview: reader.result,
          };

          setAdditionalImages((prev) => [...prev, newImage]);
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

  // Submit handler with proper discount validation
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Validate required fields
      if (!hasSizeVariants && !mainImage) {
        toast.error("Please upload a main product image");
        setIsLoading(false);
        return;
      }

      if (!values.categoryId) {
        toast.error("Please select a category for the product");
        setIsLoading(false);
        return;
      }

      // Validate discount fields
      if (!hasSizeVariants) {
        // Check if any discount field is filled but others are missing
        const hasDiscountType =
          values.discountType && values.discountType !== "NONE";
        const hasDiscountValue =
          values.discountValue !== null && values.discountValue !== undefined;
        const hasStartDate = Boolean(values.discountStartDate);
        const hasEndDate = Boolean(values.discountEndDate);

        // If discount type is set but value is missing
        if (hasDiscountType && !hasDiscountValue) {
          toast.error("Please enter a discount value");
          setIsLoading(false);
          return;
        }

        // If discount value is set but type is missing
        if (hasDiscountValue && !hasDiscountType) {
          toast.error("Please select a discount type");
          setIsLoading(false);
          return;
        }

        // If one date is set but the other is missing
        if ((hasStartDate && !hasEndDate) || (!hasStartDate && hasEndDate)) {
          toast.error("Please enter both start and end dates for the discount");
          setIsLoading(false);
          return;
        }
      }

      // Validate size variants if enabled
      if (hasSizeVariants) {
        if (sizeVariants.length === 0) {
          toast.error("Please add at least one size variant");
          setIsLoading(false);
          return;
        }

        // Check for required size variant fields
        for (let i = 0; i < sizeVariants.length; i++) {
          const variant = sizeVariants[i];
          if (!variant.size) {
            toast.error(`Please enter a name for size variant ${i + 1}`);
            setIsLoading(false);
            return;
          }

          // Validate size variant discount fields
          const hasDiscountType =
            variant.discountType && variant.discountType !== "NONE";
          const hasDiscountValue =
            variant.discountValue !== null &&
            variant.discountValue !== undefined;
          const hasStartDate = Boolean(variant.discountStartDate);
          const hasEndDate = Boolean(variant.discountEndDate);

          // If discount type is set but value is missing
          if (hasDiscountType && !hasDiscountValue) {
            toast.error(
              `Please enter a discount value for size variant ${i + 1}`
            );
            setIsLoading(false);
            return;
          }

          // If discount value is set but type is missing
          if (hasDiscountValue && !hasDiscountType) {
            toast.error(
              `Please select a discount type for size variant ${i + 1}`
            );
            setIsLoading(false);
            return;
          }

          // If one date is set but the other is missing
          if ((hasStartDate && !hasEndDate) || (!hasStartDate && hasEndDate)) {
            toast.error(
              `Please enter both start and end dates for the discount on size variant ${
                i + 1
              }`
            );
            setIsLoading(false);
            return;
          }
        }
      }

      // Prepare the request payload
      const productData: any = {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: parseInt(values.categoryId),
        status: values.status,
      };

      // Add main product images if not using size variants
      if (!hasSizeVariants) {
        productData.image = {
          base64Image: mainImage?.base64Image,
          imageType: mainImage?.imageType,
        };

        if (additionalImages.length > 0) {
          productData.additionalImages = additionalImages.map((img) => ({
            base64Image: img.base64Image,
            imageType: img.imageType,
          }));
        }

        // Add discount fields if both type and value are provided
        if (
          values.discountType &&
          values.discountType !== "NONE" &&
          values.discountValue !== null
        ) {
          productData.discountType = values.discountType;
          productData.discountValue = values.discountValue;

          // Add date range only if both dates are provided
          if (values.discountStartDate && values.discountEndDate) {
            productData.discountStartDate = values.discountStartDate;
            productData.discountEndDate = values.discountEndDate;
          }
        }
      } else {
        // Add size variants
        productData.sizes = sizeVariants.map((variant) => {
          const size: any = {
            size: variant.size,
            price: variant.price,
            status: variant.status,
          };

          // Add size discount if applicable
          if (
            variant.discountType &&
            variant.discountType !== "NONE" &&
            variant.discountValue !== null
          ) {
            size.discountType = variant.discountType;
            size.discountValue = variant.discountValue;

            if (variant.discountStartDate && variant.discountEndDate) {
              size.discountStartDate = variant.discountStartDate;
              size.discountEndDate = variant.discountEndDate;
            }
          }

          // Add size image if available
          if (variant.mainImage) {
            size.image = {
              base64Image: variant.mainImage.base64Image,
              imageType: variant.mainImage.imageType,
            };
          }

          // Add size additional images if available
          if (variant.additionalImages.length > 0) {
            size.additionalImages = variant.additionalImages.map((img) => ({
              base64Image: img.base64Image,
              imageType: img.imageType,
            }));
          }

          return size;
        });
      }

      console.log("Submitting product data:", productData);

      const response = await createProductService(productData);
      if (!response) {
        toast.error("Failed to create product");
        setIsLoading(false);
        return;
      }

      toast.success("Product created successfully");
      router.push("/dashboard/products");
      router.refresh();
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
    <div className="container-fluid pb-12">
      <div className="flex items-center justify-between mb-6">
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
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
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
                    control={form.control as any}
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
                    control={form.control as any}
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
                    control={form.control as any}
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
                      control={form.control as any}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price*</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              disabled={hasSizeVariants}
                            />
                          </FormControl>
                          {hasSizeVariants && (
                            <p className="text-xs text-muted-foreground">
                              Price is managed at the size level
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as any}
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

                  {/* Size Variants Section */}
                  <div className="space-y-4">
                    <h3 className="text-base font-medium">Product Variants</h3>

                    <FormField
                      control={form.control as any}
                      name="hasSizeVariants"
                      render={({ field }) => (
                        <FormItem className="rounded-md border p-4 hover:bg-muted/10 transition-colors">
                          <div className="flex flex-row items-center space-x-3">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.checked);

                                  // If enabling size variants and none exist, add the first one
                                  if (
                                    e.target.checked &&
                                    sizeVariants.length === 0
                                  ) {
                                    addSizeVariant();
                                  }
                                }}
                                className="h-5 w-5 rounded border-border"
                              />
                            </FormControl>
                            <div className="leading-none">
                              <FormLabel className="text-base cursor-pointer">
                                Multiple sizes
                              </FormLabel>
                              <p className="text-sm text-muted-foreground mt-1">
                                Product has different sizes with separate prices
                                and images
                              </p>
                            </div>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {!hasSizeVariants && (
                    <>
                      <Separator className="my-4" />

                      <div className="space-y-4">
                        <h3 className="text-base font-medium">
                          Discount Settings (Optional)
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control as any}
                            name="discountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount Type</FormLabel>
                                <Select
                                  value={field.value || "NONE"}
                                  onValueChange={(value) =>
                                    field.onChange(
                                      value === "NONE" ? null : value
                                    )
                                  }
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select discount type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="NONE">None</SelectItem>
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
                            control={form.control as any}
                            name="discountValue"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Discount Value</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    step={
                                      form.watch("discountType") ===
                                      "PERCENTAGE"
                                        ? "1"
                                        : "0.01"
                                    }
                                    placeholder="0"
                                    value={field.value ?? ""}
                                    onChange={(e) =>
                                      field.onChange(
                                        e.target.value
                                          ? Number(e.target.value)
                                          : null
                                      )
                                    }
                                    disabled={
                                      !form.watch("discountType") ||
                                      form.watch("discountType") === "NONE"
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control as any}
                            name="discountStartDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value || null)
                                    }
                                    disabled={
                                      !form.watch("discountType") ||
                                      form.watch("discountType") === "NONE" ||
                                      !form.watch("discountValue")
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control as any}
                            name="discountEndDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>End Date</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    value={field.value || ""}
                                    onChange={(e) =>
                                      field.onChange(e.target.value || null)
                                    }
                                    disabled={
                                      !form.watch("discountType") ||
                                      form.watch("discountType") === "NONE" ||
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
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Images section - only shown if no size variants */}
            {!hasSizeVariants && (
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
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Additional Images</CardTitle>
                        <CardDescription>
                          Add up to 5 additional product images
                        </CardDescription>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {additionalImages.length}/5 images
                      </div>
                    </div>
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
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Size Variants Section */}
          {hasSizeVariants && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Size Variants</CardTitle>
                    <CardDescription>
                      Add different sizes with specific prices and images
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-1"
                    onClick={addSizeVariant}
                  >
                    <Plus className="h-4 w-4" />
                    Add Size
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {sizeVariants.map((variant, index) => (
                    <SizeVariantComponent
                      key={index}
                      index={index}
                      size={variant}
                      onUpdate={updateSizeVariant}
                      onRemove={() => {
                        // Don't allow removing the last size variant
                        if (sizeVariants.length > 1) {
                          removeSizeVariant(index);
                        } else {
                          toast.error(
                            "You must have at least one size variant"
                          );
                        }
                      }}
                      onImageUpload={(imageData) =>
                        handleSizeVariantMainImageUpload(index, imageData)
                      }
                      onAdditionalImageUpload={(imageData) =>
                        handleSizeVariantAdditionalImageUpload(index, imageData)
                      }
                      onAdditionalImageRemove={(imageIndex) =>
                        handleSizeVariantAdditionalImageRemove(
                          index,
                          imageIndex
                        )
                      }
                    />
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-1 h-12"
                    onClick={addSizeVariant}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Another Size Variant
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex justify-end gap-3 sticky bottom-0 bg-background py-4 border-t z-10">
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

// SizeVariant Component
interface SizeVariantImageData {
  base64Image: string;
  imageType: string;
  preview: string;
}

interface SizeFormValues {
  size: string;
  price: number;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
}

interface SizeVariantProps {
  index: number;
  size: SizeFormValues & {
    id?: number;
    mainImage: SizeVariantImageData | null;
    additionalImages: SizeVariantImageData[];
  };
  onUpdate: (index: number, field: keyof SizeFormValues, value: any) => void;
  onRemove: () => void;
  onImageUpload: (imageData: SizeVariantImageData | null) => void;
  onAdditionalImageUpload: (imageData: SizeVariantImageData) => void;
  onAdditionalImageRemove: (imageIndex: number) => void;
}

function SizeVariantComponent({
  index,
  size,
  onUpdate,
  onRemove,
  onImageUpload,
  onAdditionalImageUpload,
  onAdditionalImageRemove,
}: SizeVariantProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Similar fix for size variant image upload
  const handleSizeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

        onImageUpload({
          base64Image: base64,
          imageType: imageType,
          preview: reader.result, // This is definitely a string here
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
    if (size.additionalImages.length + files.length > 3) {
      toast.error(
        "You can only upload a maximum of 3 additional images per size"
      );
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

          onAdditionalImageUpload({
            base64Image: base64,
            imageType: imageType,
            preview: reader.result,
          });
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset file input to allow selecting the same files again
    e.target.value = "";
  };

  // Handle discount fields
  const [discountType, setDiscountType] = useState<string | null>(
    size.discountType || null
  );
  const [discountValue, setDiscountValue] = useState<number | null>(
    size.discountValue || null
  );
  const [startDate, setStartDate] = useState<string | null>(
    size.discountStartDate || null
  );
  const [endDate, setEndDate] = useState<string | null>(
    size.discountEndDate || null
  );

  // Update parent when discount values change
  useEffect(() => {
    if (discountType !== size.discountType) {
      onUpdate(index, "discountType", discountType);
    }
  }, [discountType, index, onUpdate, size.discountType]);

  useEffect(() => {
    if (discountValue !== size.discountValue) {
      onUpdate(index, "discountValue", discountValue);
    }
  }, [discountValue, index, onUpdate, size.discountValue]);

  useEffect(() => {
    if (startDate !== size.discountStartDate) {
      onUpdate(index, "discountStartDate", startDate);
    }
  }, [startDate, index, onUpdate, size.discountStartDate]);

  useEffect(() => {
    if (endDate !== size.discountEndDate) {
      onUpdate(index, "discountEndDate", endDate);
    }
  }, [endDate, index, onUpdate, size.discountEndDate]);

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium">Size Variant {index + 1}</h3>
        <Button variant="ghost" size="icon" onClick={onRemove} type="button">
          <Trash className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="space-y-4 md:col-span-3">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <FormLabel>Size Name</FormLabel>
              <Input
                placeholder="e.g., S, M, L, XL"
                value={size.size}
                onChange={(e) => onUpdate(index, "size", e.target.value)}
              />
            </div>

            <div>
              <FormLabel>Price</FormLabel>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={size.price}
                onChange={(e) =>
                  onUpdate(index, "price", Number(e.target.value))
                }
              />
            </div>

            <div>
              <FormLabel>Status</FormLabel>
              <Select
                value={size.status}
                onValueChange={(value) => onUpdate(index, "status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-3" />

          <h4 className="text-sm font-medium mb-2">Size Discount</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Discount Type</FormLabel>
                <Select
                  value={discountType || "NONE"}
                  onValueChange={(value) =>
                    setDiscountType(value === "NONE" ? null : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">
                      Fixed Amount ($)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <FormLabel>Discount Value</FormLabel>
                <Input
                  type="number"
                  min="0"
                  step={discountType === "PERCENTAGE" ? "1" : "0.01"}
                  placeholder="0"
                  value={discountValue ?? ""}
                  onChange={(e) =>
                    setDiscountValue(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={!discountType || discountType === "NONE"}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={startDate || ""}
                  onChange={(e) => setStartDate(e.target.value || null)}
                  disabled={
                    !discountType || discountType === "NONE" || !discountValue
                  }
                />
              </div>

              <div>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={endDate || ""}
                  onChange={(e) => setEndDate(e.target.value || null)}
                  disabled={
                    !discountType || discountType === "NONE" || !discountValue
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          {/* Improved image handling with 1:1 aspect ratio */}
          <div>
            <FormLabel>Size Image</FormLabel>
            <div className="aspect-square w-full max-w-[180px] mx-auto overflow-hidden rounded-md">
              {size.mainImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={size.mainImage.preview}
                    alt={`Size ${size.size || index + 1} main image`}
                    className="object-cover w-full h-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 rounded-full"
                    onClick={() => onImageUpload(null)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex w-full h-full flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Upload image</p>
                      <p className="text-xs text-muted-foreground">1:1 ratio</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSizeImageUpload}
                  />
                </div>
              )}
            </div>
          </div>

          <Separator className="my-2" />

          <div>
            <div className="flex items-center justify-between mb-2">
              <FormLabel>Additional Images</FormLabel>
              <span className="text-xs text-muted-foreground">
                {size.additionalImages.length}/3 images
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {size.additionalImages?.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className="relative aspect-square overflow-hidden rounded-md border"
                >
                  <img
                    src={image.preview}
                    alt={`Size ${size.size || index + 1} additional image ${
                      imgIndex + 1
                    }`}
                    className="object-cover h-full w-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-5 w-5 rounded-full"
                    onClick={() => onAdditionalImageRemove(imgIndex)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {size.additionalImages.length < 3 && (
                <div
                  className="aspect-square rounded-md border border-dashed flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => additionalFileInputRef.current?.click()}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
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
          </div>
        </div>
      </div>
    </div>
  );
}
