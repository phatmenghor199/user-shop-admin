import { useState } from "react";
import Image from "next/image";
import { UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ImageData {
  base64Image: string;
  imageType: string;
}

interface ImageUploaderProps {
  image?: ImageData | null;
  onImageUpload: (image: ImageData) => void;
  onImageRemove?: () => void;
  className?: string;
  icon?: React.ReactNode;
  label?: string;
}

export function ImageUploader({
  image,
  onImageUpload,
  onImageRemove,
  className,
  icon,
  label = "Upload Image",
}: ImageUploaderProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Utility function to convert file to base64
  const convertFileToBase64 = (
    file: File,
    callback: (base64: string, type: string) => void
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        // Extract base64 data and file type
        const base64 = reader.result.split(",")[1];
        const fileType = file.type.split("/")[1];
        callback(base64, fileType);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      convertFileToBase64(file, (base64Image, imageType) => {
        onImageUpload({ base64Image, imageType });
      });
    }
  };

  return (
    <div
      className={cn("relative rounded-lg border border-dashed", className)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {image ? (
        <>
          <Image
            src={`data:image/${image.imageType};base64,${image.base64Image}`}
            alt="Uploaded image"
            fill
            className="object-cover rounded-lg"
          />
          {onImageRemove && (isHovering || !className) && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6"
              onClick={onImageRemove}
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center p-2">
          {icon || (
            <UploadCloud className="mb-1 h-6 w-6 text-muted-foreground" />
          )}
          <p className="text-xs text-center text-muted-foreground">{label}</p>
          <Input
            type="file"
            accept="image/*"
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={handleImageUpload}
          />
        </div>
      )}
    </div>
  );
}
