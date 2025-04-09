import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Trash, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { BASE_URL_API } from "@/constants/api/route-api"; // Import BASE_URL_API

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SizeVariantImageData {
  id?: string;
  base64Image?: string;
  imageType?: string;
  preview: string;
  url?: string;
  isExisting?: boolean;
}

export interface SizeFormValues {
  id?: number;
  size: string;
  price: number;
  status: string;
  discountType?: string | null;
  discountValue?: number | null;
  discountStartDate?: string | null;
  discountEndDate?: string | null;
  mainImage: SizeVariantImageData | null;
  additionalImages: SizeVariantImageData[];
  isNew?: boolean;
  removedAdditionalImageIds?: string[]; // For tracking deleted images
}

interface SizeVariantProps {
  index: number;
  size: SizeFormValues;
  onUpdate: (index: number, field: keyof SizeFormValues, value: any) => void;
  onRemove: () => void;
  onImageUpload: (imageData: SizeVariantImageData | null) => void;
  onAdditionalImageUpload: (imageData: SizeVariantImageData) => void;
  onAdditionalImageRemove: (imageIndex: number) => void;
  isRemovable?: boolean;
}

export function SizeVariantComponent({
  index,
  size,
  onUpdate,
  onRemove,
  onImageUpload,
  onAdditionalImageUpload,
  onAdditionalImageRemove,
  isRemovable = true,
}: SizeVariantProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);

  // Handle size variant image upload
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
          isExisting: false, // Mark as new upload
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
            isExisting: false, // Mark as new upload
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

  // Function to get the correct image source with BASE_URL_API for existing images
  const getImageSrc = (image: SizeVariantImageData) => {
    return image.isExisting ? `${BASE_URL_API}${image.preview}` : image.preview;
  };

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-medium">
          Size Variant {index + 1}
          {size.isNew ? (
            <span className="ml-2 text-xs text-primary">(New)</span>
          ) : null}
          {!size.isNew && size.id ? (
            <span className="ml-2 text-xs text-muted-foreground">
              ID: {size.id}
            </span>
          ) : null}
        </h3>
        {isRemovable && (
          <Button variant="ghost" size="icon" onClick={onRemove} type="button">
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        )}
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
                    src={getImageSrc(size.mainImage)}
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
                    src={getImageSrc(image)}
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
