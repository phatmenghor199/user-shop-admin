"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Save, X, Plus, Trash, UploadCloud } from "lucide-react";

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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { CategorySelector } from "@/components/dashboard/products/category-selector";
import { DiscountFields } from "@/components/dashboard/products/discount-field";
import { ImageUploader } from "@/components/dashboard/products/image-uploader";
import { SizeVariant } from "@/components/dashboard/products/size-variant";

// Define enums matching the backend
enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

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

  // Discount fields (optional)
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional().nullable(),
  discountValue: z.coerce.number().optional().nullable(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),

  // Helper field for UI
  hasSizes: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const sizeSchema = z.object({
  size: z.string().min(1, { message: "Size name is required" }),
  price: z.coerce.number().min(0, { message: "Price must be zero or higher" }),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),

  // Discount fields (optional)
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional().nullable(),
  discountValue: z.coerce.number().optional().nullable(),
  discountStartDate: z.string().optional().nullable(),
  discountEndDate: z.string().optional().nullable(),
});

type SizeFormValues = z.infer<typeof sizeSchema>;

interface ImageData {
  base64Image: string;
  imageType: string;
}

export default function CreateProductPage() {
  const [mainImage, setMainImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);
  const [sizes, setSizes] = useState<
    (SizeFormValues & {
      id?: number;
      mainImage?: ImageData | null;
      additionalImages?: ImageData[];
    })[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      status: StatusData.ACTIVE,
      hasSizes: false,
    },
  });

  const hasSizes = form.watch("hasSizes");

  // Add a new size
  const addSize = () => {
    setSizes([
      ...sizes,
      {
        size: "",
        price: form.getValues().price || 0,
        status: StatusData.ACTIVE,
        mainImage: null,
        additionalImages: [],
      },
    ]);
  };

  // Remove a size
  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Update size field
  const updateSizeField = (
    index: number,
    field: keyof SizeFormValues,
    value: any
  ) => {
    const newSizes = [...sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    setSizes(newSizes);
  };

  // Handle size image upload
  const handleSizeImageUpload = (
    index: number,
    imageData: ImageData | null
  ) => {
    const newSizes = [...sizes];
    newSizes[index].mainImage = imageData;
    setSizes(newSizes);
  };

  // Handle size additional image upload
  const handleSizeAdditionalImageUpload = (
    index: number,
    imageData: ImageData
  ) => {
    const newSizes = [...sizes];
    if (!newSizes[index].additionalImages) {
      newSizes[index].additionalImages = [];
    }
    newSizes[index].additionalImages?.push(imageData);
    setSizes(newSizes);
  };

  // Remove size additional image
  const removeSizeAdditionalImage = (sizeIndex: number, imageIndex: number) => {
    const newSizes = [...sizes];
    if (newSizes[sizeIndex].additionalImages) {
      newSizes[sizeIndex].additionalImages = newSizes[
        sizeIndex
      ].additionalImages?.filter((_, i) => i !== imageIndex);
    }
    setSizes(newSizes);
  };

  // Toggle sizes feature
  const toggleSizeVariants = (value: boolean) => {
    form.setValue("hasSizes", value);

    if (value && sizes.length === 0) {
      addSize();
    }
  };

  // Utility function to check if a date is valid
  const isValidDate = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);

      // Validate category selection
      if (!values.categoryId) {
        toast({
          title: "Error",
          description: "Please select a category for the product",
          variant: "destructive",
        });
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
      };

      // Add image only if provided (can be null)
      if (mainImage) {
        Object.assign(productData, { image: mainImage });
      }

      // Add additional images only if provided
      if (additionalImages.length > 0) {
        Object.assign(productData, { additionalImages });
      }

      // Add discount fields if both type and value are provided
      if (
        values.discountType &&
        values.discountValue !== null &&
        values.discountValue !== undefined
      ) {
        Object.assign(productData, {
          discountType: values.discountType,
          discountValue: values.discountValue,
        });

        // Add date range only if both dates are provided
        if (
          isValidDate(values.discountStartDate) &&
          isValidDate(values.discountEndDate)
        ) {
          Object.assign(productData, {
            discountStartDate: values.discountStartDate,
            discountEndDate: values.discountEndDate,
          });
        }
      }

      // Add sizes if enabled
      if (values.hasSizes && sizes.length > 0) {
        // Validate sizes have names
        const invalidSizes = sizes.filter((size) => !size.size.trim());
        if (invalidSizes.length > 0) {
          toast({
            title: "Error",
            description: "All size variants must have a name",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        Object.assign(productData, {
          sizes: sizes.map((size) => {
            const sizeData: any = {
              size: size.size,
              price: size.price,
              status: size.status,
            };

            // Add size image only if provided
            if (size.mainImage) {
              sizeData.image = size.mainImage;
            }

            // Add size additional images if provided
            if (size.additionalImages?.length) {
              sizeData.additionalImages = size.additionalImages;
            }

            // Add size discount only if both type and value are provided
            if (
              size.discountType &&
              size.discountValue !== null &&
              size.discountValue !== undefined
            ) {
              sizeData.discountType = size.discountType;
              sizeData.discountValue = size.discountValue;

              // Add size discount dates if provided
              if (
                isValidDate(size.discountStartDate) &&
                isValidDate(size.discountEndDate)
              ) {
                sizeData.discountStartDate = size.discountStartDate;
                sizeData.discountEndDate = size.discountEndDate;
              }
            }

            return sizeData;
          }),
        });
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

      toast({
        title: "Success",
        description: "Product created successfully",
      });

      // Redirect to products list page
      router.push("/dashboard/products");
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      });
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

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="sizes">Sizes & Variants</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="basic">
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
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter product name"
                                {...field}
                              />
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
                            <FormLabel>Category</FormLabel>
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
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter product description"
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
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
                              <FormLabel>Status</FormLabel>
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

                      <Separator className="my-2" />

                      <FormField
                        control={form.control}
                        name="hasSizes"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Product Has Size Variants
                              </FormLabel>
                              <FormDescription>
                                Enable for different sizes with different prices
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={(value) => {
                                  field.onChange(value);
                                  toggleSizeVariants(value);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <Separator className="my-2" />

                      <div className="space-y-4">
                        <h3 className="text-base font-medium">
                          Discount Settings
                        </h3>
                        <DiscountFields
                          form={form}
                          discountTypeField="discountType"
                          discountValueField="discountValue"
                          startDateField="discountStartDate"
                          endDateField="discountEndDate"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Images */}
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle>Product Images</CardTitle>
                    <CardDescription>Upload product images</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Main Image</h3>
                        <ImageUploader
                          image={mainImage}
                          onImageUpload={setMainImage}
                          onImageRemove={() => setMainImage(null)}
                          className="aspect-square h-36"
                        />
                      </div>

                      <Separator className="my-2" />

                      <div>
                        <h3 className="text-sm font-medium mb-2">
                          Additional Images
                        </h3>
                        <div className="grid gap-2 grid-cols-2">
                          {additionalImages.map((image, index) => (
                            <div
                              key={index}
                              className="relative aspect-square h-16 overflow-hidden rounded-md border"
                            >
                              <Image
                                src={`data:image/${image.imageType};base64,${image.base64Image}`}
                                alt={`Additional image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute right-1 top-1 h-5 w-5"
                                onClick={() =>
                                  setAdditionalImages(
                                    additionalImages.filter(
                                      (_, i) => i !== index
                                    )
                                  )
                                }
                                type="button"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                          {additionalImages.length < 4 && (
                            <ImageUploader
                              onImageUpload={(data) =>
                                setAdditionalImages([...additionalImages, data])
                              }
                              className="aspect-square h-16"
                              icon={<Plus className="h-4 w-4" />}
                              label="Add"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sizes">
              <Card>
                <CardHeader>
                  <CardTitle>Size Variants</CardTitle>
                  <CardDescription>
                    {hasSizes
                      ? "Manage different sizes and their specific prices and images."
                      : "Enable size variants in the Basic Information tab to manage different sizes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasSizes ? (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground mb-2">
                        Size variants are disabled
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => toggleSizeVariants(true)}
                      >
                        Enable Size Variants
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sizes.map((size, index) => (
                        <SizeVariant
                          key={index}
                          index={index}
                          size={size}
                          onUpdate={updateSizeField}
                          onRemove={() => removeSize(index)}
                          onImageUpload={(imageData) =>
                            handleSizeImageUpload(index, imageData)
                          }
                          onAdditionalImageUpload={(imageData) =>
                            handleSizeAdditionalImageUpload(index, imageData)
                          }
                          onAdditionalImageRemove={(imageIndex) =>
                            removeSizeAdditionalImage(index, imageIndex)
                          }
                        />
                      ))}

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={addSize}
                        type="button"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Size
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancel</Link>
              </Button>
              <Button type="submit" className="gap-1" disabled={isLoading}>
                <Save className="h-4 w-4" />
                {isLoading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
