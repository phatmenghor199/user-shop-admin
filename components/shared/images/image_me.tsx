import { useEffect, useState } from "react";
import Image from "next/image";
import { Loader, ImageOff, ExternalLink } from "lucide-react";

interface ImageMeProps {
  imageUrl: string;
  fallbackSrc?: string;
  width?: number;
  height?: number;
  borderRadius?: number | string;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  className?: string;
  imgClassName?: string;
  alt?: string;
  clickable?: boolean;
  priority?: boolean;
  showExternalLinkIcon?: boolean;
}

const ImageMe: React.FC<ImageMeProps> = ({
  imageUrl,
  fallbackSrc = "/placeholder.svg",
  width = 64,
  height = 64,
  borderRadius = 4,
  fit = "cover",
  className = "",
  imgClassName = "",
  alt = "Image",
  clickable = true,
  priority = false,
  showExternalLinkIcon = false,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [src, setSrc] = useState(imageUrl || fallbackSrc);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setSrc(imageUrl);
      setHasError(false);
      setIsLoading(true);
    } else {
      setSrc(fallbackSrc);
      setIsLoading(false);
    }
  }, [imageUrl, fallbackSrc]);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
    setSrc(fallbackSrc);
  };

  const handleMouseEnter = () => {
    if (clickable) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (clickable && imageUrl && !hasError) {
      window.open(imageUrl, "_blank");
    }
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        borderRadius:
          typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius,
        overflow: "hidden",
      }}
    >
      <div
        className={`relative ${clickable ? "cursor-pointer" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          aspectRatio: `${width}/${height}`,
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          style={{
            objectFit: fit,
          }}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full transition-opacity duration-200 ${
            isLoading ? "opacity-50" : "opacity-100"
          } ${imgClassName}`}
        />

        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-black/20">
            <Loader
              className="animate-spin text-white"
              size={Math.max(16, Math.min(width, height) / 4)}
            />
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100">
            <ImageOff
              className="text-gray-400"
              size={Math.max(16, Math.min(width, height) / 4)}
            />
          </div>
        )}

        {/* External Link Icon */}
        {showExternalLinkIcon &&
          clickable &&
          !isLoading &&
          !hasError &&
          isHovered && (
            <div className="absolute top-0 right-0 p-1 bg-black/40 rounded-bl">
              <ExternalLink
                size={Math.max(12, Math.min(width, height) / 6)}
                className="text-white"
              />
            </div>
          )}
      </div>
    </div>
  );
};

export default ImageMe;
