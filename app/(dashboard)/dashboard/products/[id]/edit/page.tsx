"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ArrowLeft, Save, X, Plus, AlertTriangle } from "lucide-react";

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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CategorySelector } from "@/components/dashboard/products/category-selector";
import { toast } from "sonner";
import {
  addProductSizeService,
  getProductByIdService,
  removeProductSizeService,
  updateProductAdminService,
  updateProductSizeService,
  updateProductMainImageService,
  addProductAdditionalImagesService,
  removeProductAdditionalImageService,
  updateProductSizeMainImageService,
  addProductSizeAdditionalImagesService,
  removeProductSizeAdditionalImageService,
  resetProductDiscountService,
} from "@/services/dashboard/product.service";
import {
  SizeFormValues,
  SizeVariantComponent,
  SizeVariantImageData,
} from "@/components/dashboard/products/size-variant-component";
import { CreateProductModel } from "@/models/dashboard/product/create-product.model";
import { SizeUpdateModel } from "@/models/dashboard/product/size-update.model";
import { BASE_URL_API } from "@/constants/api/route-api";
import ConfirmDialog from "@/components/shared/modal/confirm-action";

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
  id?: string;
  base64Image?: string;
  imageType?: string;
  preview: string;
  url?: string;
  isExisting?: boolean;
}

export default function EditProductPage() {
  const params = useParams();
  const [mainImage, setMainImage] = useState<ImageData | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ImageData[]>([]);
  const [removedAdditionalImageIds, setRemovedAdditionalImageIds] = useState<
    string[]
  >([]);
  const [sizeVariants, setSizeVariants] = useState<SizeFormValues[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sizeToDelete, setSizeToDelete] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletePromotion, setIsDeletepromotion] = useState(false);
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

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoadingData(true);
        setErrorMsg(null);

        // Fetch product details
        const productResponse = await getProductByIdService(Number(params.id));
        if (!productResponse) {
          throw new Error("Failed to fetch product data");
        }

        const productData = productResponse;

        // Set form values
        form.reset({
          name: productData.name,
          description: productData.description,
          categoryId: productData.categoryId.toString(),
          price: productData.price,
          status: productData.status,
          discountType: productData.discountType || null,
          discountValue: productData.discountValue || null,
          discountStartDate: productData.discountStartDate || null,
          discountEndDate: productData.discountEndDate || null,
          hasSizeVariants: Boolean(
            productData.sizes && productData.sizes.length > 0
          ),
        });

        // Set main image if exists
        if (productData.mainImage) {
          setMainImage({
            id: productData.mainImage.id,
            preview: `${productData.mainImage.url}`,
            url: productData.mainImage.url,
            isExisting: true,
          });
        }

        // Set additional images if exist
        if (
          productData.additionalImages &&
          productData.additionalImages.length > 0
        ) {
          setAdditionalImages(
            productData.additionalImages.map((img: ImageData) => ({
              id: img.id,
              preview: `${img.url}`,
              url: img.url,
              isExisting: true,
            }))
          );
        }

        // Set size variants if available
        if (productData.sizes && productData.sizes.length > 0) {
          const sizes = productData.sizes.map((size: SizeFormValues) => {
            const sizeVariant: SizeFormValues = {
              id: size.id,
              size: size.size,
              price: size.price,
              status: size.status,
              discountType: size.discountType || null,
              discountValue: size.discountValue || null,
              discountStartDate: size.discountStartDate || null,
              discountEndDate: size.discountEndDate || null,
              mainImage: size.mainImage
                ? {
                    id: size.mainImage.id,
                    preview: `${size.mainImage.url}`,
                    url: size.mainImage.url,
                    isExisting: true,
                  }
                : null,
              additionalImages: size.additionalImages
                ? size.additionalImages.map((img) => ({
                    id: img.id,
                    preview: `${img.url}`,
                    url: img.url,
                    isExisting: true,
                  }))
                : [],
              removedAdditionalImageIds: [],
            };
            return sizeVariant;
          });
          setSizeVariants(sizes);
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Failed to load product data. Please try again."
        );
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchProductData();
  }, [params.id, form]);

  // Toggle for size variants with proper handling
  useEffect(() => {
    // If switching from non-size to size variants, add a default size if none exist
    if (hasSizeVariants && sizeVariants.length === 0) {
      const currentPrice = form.getValues("price");
      const currentDiscount = {
        discountType: form.getValues("discountType"),
        discountValue: form.getValues("discountValue"),
        discountStartDate: form.getValues("discountStartDate"),
        discountEndDate: form.getValues("discountEndDate"),
      };

      const newSizeVariant: SizeFormValues = {
        size: "Default",
        price: currentPrice > 0 ? currentPrice : 0,
        status: form.getValues("status"),
        discountType: currentDiscount.discountType,
        discountValue: currentDiscount.discountValue,
        discountStartDate: currentDiscount.discountStartDate,
        discountEndDate: currentDiscount.discountEndDate,
        mainImage: mainImage,
        additionalImages: [...additionalImages],
        isNew: true,
        removedAdditionalImageIds: [],
      };

      setSizeVariants([newSizeVariant]);
    }
    // If switching from size variants to non-size, we don't need to do anything
    // The existing size variants will remain in state but won't be shown or submitted
  }, [hasSizeVariants, sizeVariants.length, form, mainImage, additionalImages]);

  // Add a new size variant
  const addSizeVariant = () => {
    const currentPrice = form.getValues("price");
    setSizeVariants([
      ...sizeVariants,
      {
        size: "",
        price: currentPrice > 0 ? currentPrice : 0,
        status: StatusData.ACTIVE,
        discountType: null,
        discountValue: null,
        discountStartDate: null,
        discountEndDate: null,
        mainImage: null,
        additionalImages: [],
        isNew: true,
        removedAdditionalImageIds: [],
      },
    ]);
  };

  // Handle confirmed size deletion
  const handleConfirmSizeDelete = async () => {
    if (sizeToDelete === null) return;

    const variant = sizeVariants[sizeToDelete];
    if (!variant.id) {
      // This shouldn't happen, but just in case
      setSizeVariants(sizeVariants.filter((_, i) => i !== sizeToDelete));
      setIsDeleteDialogOpen(false);
      setSizeToDelete(null);
      return;
    }

    try {
      setIsLoading(true);
      const response = await removeProductSizeService(
        Number(params.id),
        variant.id
      );

      if (response) {
        toast.success(`Size "${variant.size}" removed successfully`);
        setSizeVariants(sizeVariants.filter((_, i) => i !== sizeToDelete));
      } else {
        toast.error(`Failed to remove size "${variant.size}"`);
      }
    } catch (error) {
      console.error("Error removing size variant:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to remove size "${variant.size}"`
      );
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      setSizeToDelete(null);
    }
  };

  // Update a size variant
  const updateSizeVariant = (
    index: number,
    field: keyof SizeFormValues,
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
    imageData: SizeVariantImageData | null
  ) => {
    const updatedVariants = [...sizeVariants];
    updatedVariants[index].mainImage = imageData;
    setSizeVariants(updatedVariants);
  };

  // Handle size variant additional image upload
  const handleSizeVariantAdditionalImageUpload = (
    variantIndex: number,
    imageData: SizeVariantImageData
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

  // 1. First, fix the handleSizeVariantAdditionalImageRemove function:
  const handleSizeVariantAdditionalImageRemove = (
    variantIndex: number,
    imageIndex: number
  ) => {
    const updatedVariants = [...sizeVariants];
    const imageToRemove =
      updatedVariants[variantIndex].additionalImages[imageIndex];

    // If the image is existing (has an ID), add it to the removedAdditionalImageIds array
    if (imageToRemove.isExisting && imageToRemove.id) {
      if (!updatedVariants[variantIndex].removedAdditionalImageIds) {
        updatedVariants[variantIndex].removedAdditionalImageIds = [];
      }
      updatedVariants[variantIndex].removedAdditionalImageIds.push(
        imageToRemove.id
      );
    }

    // Remove the image from the additionalImages array
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

  // Handle additional image upload
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
    const imageToRemove = additionalImages[index];

    // If the image is existing (has an ID), add it to the removedAdditionalImageIds array
    if (imageToRemove.isExisting && imageToRemove.id) {
      setRemovedAdditionalImageIds((prev) => [...prev, imageToRemove.id!]);
    }

    setAdditionalImages((images) => images.filter((_, i) => i !== index));
  };

  // Handle removing the main image
  const handleRemoveMainImage = () => {
    setMainImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 2. Then fix the onSubmit function to properly handle existing size variants
  // This is the main part that needs to be fixed
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

      // Prepare the request payload
      const productData: CreateProductModel = {
        name: values.name,
        description: values.description,
        price: values.price,
        categoryId: parseInt(values.categoryId),
        status: values.status,
      };

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

      console.log("Submitting product update:", productData);

      // Update the base product first
      const response = await updateProductAdminService(
        Number(params.id),
        productData
      );

      if (!response) {
        toast.error("Failed to update product");
        setIsLoading(false);
        return;
      }

      // Handle image updates separately using dedicated endpoints
      if (!hasSizeVariants) {
        // Update main image if it's changed (has base64Image)
        if (mainImage?.base64Image) {
          await updateProductMainImageService(Number(params.id), {
            base64Image: mainImage.base64Image,
            imageType: mainImage.imageType || "jpeg",
          });
        }

        // Handle new additional images
        const newAdditionalImages = additionalImages.filter(
          (img) => img.base64Image
        );
        if (newAdditionalImages.length > 0) {
          const imagesData = newAdditionalImages.map((img) => ({
            base64Image: img.base64Image || "",
            imageType: img.imageType || "jpeg",
          }));
          await addProductAdditionalImagesService(
            Number(params.id),
            imagesData
          );
        }

        // Remove deleted additional images
        for (const imageId of removedAdditionalImageIds) {
          await removeProductAdditionalImageService(Number(params.id), imageId);
        }
      }

      // Handle size variants if enabled
      if (hasSizeVariants) {
        // Validate size variants
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

        // *** THE FIX: Instead of removing all existing sizes and recreating them,
        // distinguish between existing and new size variants ***

        // Get existing product data
        const existingProduct = await getProductByIdService(Number(params.id));
        const existingSizeIds = new Set(
          existingProduct?.sizes
            ? existingProduct.sizes.map((s: { id: number }) => s.id)
            : []
        );

        // Separate size variants into new and existing ones
        const newSizeVariants = sizeVariants.filter(
          (v) => !v.id || !existingSizeIds.has(v.id)
        );
        const existingSizeVariants = sizeVariants.filter(
          (v) => v.id && existingSizeIds.has(v.id)
        );

        // Update existing size variants
        for (const variant of existingSizeVariants) {
          // Skip variants without ID (shouldn't happen, but just in case)
          if (!variant.id) continue;

          // Prepare size data
          const sizeData: SizeUpdateModel = {
            size: variant.size,
            price: variant.price,
            status: variant.status,
          };

          // Add discount fields if applicable
          if (
            variant.discountType &&
            variant.discountType !== "NONE" &&
            variant.discountValue !== null
          ) {
            sizeData.discountType = variant.discountType;
            sizeData.discountValue = variant.discountValue;

            if (variant.discountStartDate && variant.discountEndDate) {
              sizeData.discountStartDate = variant.discountStartDate;
              sizeData.discountEndDate = variant.discountEndDate;
            }
          }

          // Update the size
          await updateProductSizeService(
            Number(params.id),
            variant.id,
            sizeData
          );

          // Update main image if changed
          if (variant.mainImage?.base64Image) {
            await updateProductSizeMainImageService(
              Number(params.id),
              variant.id,
              {
                base64Image: variant.mainImage.base64Image,
                imageType: variant.mainImage.imageType || "jpeg",
              }
            );
          }

          // Add new additional images
          const newSizeAdditionalImages = variant.additionalImages.filter(
            (img) => img.base64Image
          );

          if (newSizeAdditionalImages.length > 0) {
            const imagesData = newSizeAdditionalImages.map((img) => ({
              base64Image: img.base64Image || "",
              imageType: img.imageType || "jpeg",
            }));

            await addProductSizeAdditionalImagesService(
              Number(params.id),
              variant.id,
              imagesData
            );
          }

          // Handle removed additional images
          if (
            variant.removedAdditionalImageIds &&
            variant.removedAdditionalImageIds.length > 0
          ) {
            for (const imageId of variant.removedAdditionalImageIds) {
              await removeProductSizeAdditionalImageService(
                Number(params.id),
                variant.id,
                imageId
              );
            }
          }
        }

        // Create new size variants (if any)
        if (newSizeVariants.length > 0) {
          // Prepare an array of size data for new variants
          const newSizesData: SizeUpdateModel[] = newSizeVariants.map(
            (variant) => ({
              size: variant.size,
              price: variant.price,
              status: variant.status,
              ...(variant.discountType &&
              variant.discountType !== "NONE" &&
              variant.discountValue !== null
                ? {
                    discountType: variant.discountType,
                    discountValue: variant.discountValue,
                    ...(variant.discountStartDate && variant.discountEndDate
                      ? {
                          discountStartDate: variant.discountStartDate,
                          discountEndDate: variant.discountEndDate,
                        }
                      : {}),
                  }
                : {}),
            })
          );

          // Create new sizes
          const sizeResponse = await addProductSizeService(
            Number(params.id),
            newSizesData
          );

          // Process each added size variant
          const addedSizes = sizeResponse?.data?.sizes || [];

          for (
            let i = 0;
            i < addedSizes.length && i < newSizeVariants.length;
            i++
          ) {
            const newVariantId = addedSizes[i].id;
            const variant = newSizeVariants[i];

            if (!newVariantId) {
              console.error("Failed to get new size variant ID", sizeResponse);
              toast.error(`Failed to add size variant: ${variant.size}`);
              continue;
            }

            // Update size main image if it exists
            if (variant.mainImage?.base64Image) {
              await updateProductSizeMainImageService(
                Number(params.id),
                newVariantId,
                {
                  base64Image: variant.mainImage.base64Image,
                  imageType: variant.mainImage.imageType || "jpeg",
                }
              );
            }

            // Add new additional images for the size
            const newSizeAdditionalImages = variant.additionalImages.filter(
              (img) => img.base64Image
            );

            if (newSizeAdditionalImages.length > 0) {
              const imagesData = newSizeAdditionalImages.map((img) => ({
                base64Image: img.base64Image || "",
                imageType: img.imageType || "jpeg",
              }));

              await addProductSizeAdditionalImagesService(
                Number(params.id),
                newVariantId,
                imagesData
              );
            }
          }
        }

        // Find IDs of sizes that were removed in the UI
        const currentSizeIds = new Set(
          sizeVariants.filter((v) => v.id).map((v) => v.id)
        );
        const sizesToRemove =
          existingProduct?.sizes?.filter(
            (s: { id: number }) => !currentSizeIds.has(s.id)
          ) || [];

        // Remove sizes that no longer exist in the UI
        for (const sizeToRemove of sizesToRemove) {
          await removeProductSizeService(Number(params.id), sizeToRemove.id);
        }
      }

      toast.success("Product updated successfully");
      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeSizeVariant = async (index: number) => {
    const variant = sizeVariants[index];

    // If it's a new variant that hasn't been saved to the server
    if (variant.isNew || !variant.id) {
      // If this is the last size variant, reset to non-size variant
      if (sizeVariants.length === 1) {
        // Reset size variants and uncheck hasSizeVariants
        setSizeVariants([]);
        form.setValue("hasSizeVariants", false);

        // Reset any size-specific fields
        form.setValue("price", 0);
        form.setValue("discountType", null);
        form.setValue("discountValue", null);
        form.setValue("discountStartDate", null);
        form.setValue("discountEndDate", null);
      } else {
        // Just remove this specific variant
        setSizeVariants(sizeVariants.filter((_, i) => i !== index));
      }
      return;
    }

    // For existing variants, we need to confirm and then call the API
    setSizeToDelete(index);
    setIsDeleteDialogOpen(true);
  };

  async function resetDiscountProduct() {
    try {
      setIsLoading(true);
      const response = await resetProductDiscountService(Number(params.id));
      if (response) {
        // Reset form values related to discount for main product
        form.setValue("discountType", null);
        form.setValue("discountValue", null);
        form.setValue("discountStartDate", null);
        form.setValue("discountEndDate", null);

        // Reset discount for all size variants
        const updatedVariants = sizeVariants.map((variant) => {
          // If the variant has an existing ID, we'll call the update service
          if (variant.id) {
            updateProductSizeService(Number(params.id), variant.id, {
              size: variant.size,
              price: variant.price,
              status: variant.status,
              discountType: null,
              discountValue: null,
              discountStartDate: null,
              discountEndDate: null,
            }).catch((error) => {
              console.error(
                `Error resetting discount for size variant ${variant.size}:`,
                error
              );
            });
          }

          // Update local state
          return {
            ...variant,
            discountType: null,
            discountValue: null,
            discountStartDate: null,
            discountEndDate: null,
          };
        });

        setSizeVariants(updatedVariants);
        toast.success("Product promotion reset successfully");
      } else {
        toast.error("Failed to reset product promotion");
      }
    } catch (error) {
      console.error("Error resetting promotion:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reset promotion"
      );
    } finally {
      setIsLoading(false);
    }
  }

  // If we're still loading data, show a loading state
  if (isLoadingData) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  // If there was an error loading data, show an error
  if (errorMsg) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold tracking-tight">Edit Product</h2>
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
                  Update the basic information of your product.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control as any}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name*</FormLabel>
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
                  </div>

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
                            value={field.value}
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
                              src={
                                mainImage.isExisting
                                  ? `${BASE_URL_API}${mainImage.preview}`
                                  : mainImage.preview
                              }
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
                              src={
                                image.isExisting
                                  ? `${BASE_URL_API}${image.preview}`
                                  : image.preview
                              }
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
                      Manage different sizes with specific prices and images
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
                      key={variant.id || `new-${index}`}
                      index={index}
                      size={variant}
                      onUpdate={updateSizeVariant}
                      onRemove={() => {
                        // Don't allow removing the last size variant
                        if (sizeVariants.length > 0) {
                          removeSizeVariant(index);
                        } else {
                          toast.error(
                            "You must have at least one size variant"
                          );
                        }
                      }}
                      onImageUpload={(imageData: SizeVariantImageData | null) =>
                        handleSizeVariantMainImageUpload(index, imageData)
                      }
                      onAdditionalImageUpload={(
                        imageData: SizeVariantImageData
                      ) =>
                        handleSizeVariantAdditionalImageUpload(index, imageData)
                      }
                      onAdditionalImageRemove={(imageIndex: number) =>
                        handleSizeVariantAdditionalImageRemove(
                          index,
                          imageIndex
                        )
                      }
                      isRemovable={sizeVariants.length > 0}
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

          <div className="mt-6 flex justify-between gap-3 sticky bottom-0 bg-background py-4 border-t z-10">
            <Button
              variant="destructive"
              type="button"
              disabled={isLoading}
              onClick={() => setIsDeletepromotion(true)}
            >
              Reset Promotion
            </Button>

            <div className="gap-3 flex items-center">
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
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* Size variant deletion confirmation dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Remove Size Variant"
        description="Are you sure you want to remove this size variant? This action cannot be undone."
        confirmLabel="Remove Size"
        variant="danger"
        onConfirm={handleConfirmSizeDelete}
        showIcon={true}
      />

      <ConfirmDialog
        isOpen={isDeletePromotion}
        onClose={() => setIsDeletepromotion(false)}
        title="Remove Product promotion"
        description="Are you sure you want to remove product promotion? This action cannot be undone."
        confirmLabel="Remove promotion"
        variant="danger"
        onConfirm={resetDiscountProduct}
        showIcon={true}
      />
    </div>
  );
}
