import React from "react";
import { Trash, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImageUploader } from "./image-uploader";
import { UseFormReturn, useForm } from "react-hook-form";
import { DiscountFields } from "./discount-field";

enum StatusData {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

interface ImageData {
  base64Image: string;
  imageType: string;
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

type SizeVariantFormValues = {
  [key: string]: string | number | null | undefined;
};

interface SizeVariantProps {
  index: number;
  size: SizeFormValues & {
    id?: number;
    mainImage?: ImageData | null;
    additionalImages?: ImageData[];
  };
  onUpdate: (index: number, field: keyof SizeFormValues, value: any) => void;
  onRemove: () => void;
  onImageUpload: (imageData: ImageData | null) => void;
  onAdditionalImageUpload: (imageData: ImageData) => void;
  onAdditionalImageRemove: (imageIndex: number) => void;
}

export function SizeVariant({
  index,
  size,
  onUpdate,
  onRemove,
  onImageUpload,
  onAdditionalImageUpload,
  onAdditionalImageRemove,
}: SizeVariantProps) {
  // Dynamic field names
  const discountTypeField = `size_${index}_discountType`;
  const discountValueField = `size_${index}_discountValue`;
  const startDateField = `size_${index}_discountStartDate`;
  const endDateField = `size_${index}_discountEndDate`;

  // Create form with dynamic default values
  const form = useForm<SizeVariantFormValues>({
    defaultValues: {
      [discountTypeField]: size.discountType ?? null,
      [discountValueField]: size.discountValue ?? null,
      [startDateField]: size.discountStartDate ?? null,
      [endDateField]: size.discountEndDate ?? null,
    },
  });

  // Correctly type and use watch
  const discountType = form.watch(discountTypeField);
  const discountValue = form.watch(discountValueField);
  const startDate = form.watch(startDateField);
  const endDate = form.watch(endDateField);

  // Effect to update parent component
  React.useEffect(() => {
    if (discountType !== size.discountType) {
      onUpdate(index, "discountType", discountType);
    }
    if (discountValue !== size.discountValue) {
      onUpdate(index, "discountValue", discountValue);
    }
    if (startDate !== size.discountStartDate) {
      onUpdate(index, "discountStartDate", startDate);
    }
    if (endDate !== size.discountEndDate) {
      onUpdate(index, "discountEndDate", endDate);
    }
  }, [discountType, discountValue, startDate, endDate, index, onUpdate, size]);

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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StatusData.ACTIVE}>Active</SelectItem>
                  <SelectItem value={StatusData.INACTIVE}>Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-3" />

          <h4 className="text-sm font-medium mb-2">Size Discount</h4>
          <DiscountFields
            form={form as UseFormReturn<SizeVariantFormValues>}
            discountTypeField={discountTypeField}
            discountValueField={discountValueField}
            startDateField={startDateField}
            endDateField={endDateField}
            prefix={`size_${index}_`}
          />
        </div>

        <div className="md:col-span-2 space-y-3">
          <div>
            <FormLabel>Size Image</FormLabel>
            <ImageUploader
              image={size.mainImage}
              onImageUpload={onImageUpload}
              onImageRemove={() => onImageUpload(null)}
              className="aspect-square h-40"
            />
          </div>

          <Separator className="my-2" />

          <div>
            <FormLabel>Additional Images</FormLabel>
            <div className="grid grid-cols-3 gap-2">
              {size.additionalImages?.map((image, imgIndex) => (
                <div
                  key={imgIndex}
                  className="relative aspect-square h-16 overflow-hidden rounded-md border"
                >
                  <img
                    src={`data:image/${image.imageType};base64,${image.base64Image}`}
                    alt={`Size ${size.size} additional image ${imgIndex + 1}`}
                    className="object-cover h-full w-full"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute right-1 top-1 h-5 w-5"
                    onClick={() => onAdditionalImageRemove(imgIndex)}
                    type="button"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {(!size.additionalImages || size.additionalImages.length < 3) && (
                <ImageUploader
                  onImageUpload={onAdditionalImageUpload}
                  className="aspect-square h-16"
                  icon={<Plus className="h-4 w-4" />}
                  label="Add"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
