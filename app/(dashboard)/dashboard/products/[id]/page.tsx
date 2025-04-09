"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Tag,
  Ruler,
  Percent,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getProductByIdService } from "@/services/dashboard/product.service";
import { BASE_URL_API } from "@/constants/api/route-api";
import { ProductModel, Size } from "@/models/dashboard/product/product.model";
import { ImageModel } from "@/models/setting/image/image.model";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        const productId = Number(params.id);

        if (isNaN(productId)) {
          throw new Error("Invalid product ID");
        }

        const response = await getProductByIdService(productId);

        if (!response) {
          throw new Error("Product not found");
        }

        setProduct(response);

        // If size variants exist, select the first active size by default
        if (response.sizes && response.sizes.length > 0) {
          const activeSize = response.sizes.find(
            (size) => size.status === "ACTIVE"
          );
          setSelectedSize(activeSize || response.sizes[0]);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
        setErrorMsg(
          error instanceof Error
            ? error.message
            : "Failed to load product details. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [params.id]);

  // Collect all images for carousel
  const getAllImages = useMemo((): ImageModel[] => {
    if (!product) return [];

    const images: ImageModel[] = [];

    // If product has sizes and a size is selected
    if (product.sizes && product.sizes.length > 0 && selectedSize) {
      // Prioritize size-specific images
      if (selectedSize.mainImage) {
        images.push(selectedSize.mainImage);
      }

      // Add size additional images
      images.push(...(selectedSize.additionalImages || []));
    }

    // If no size images, use product images
    if (images.length === 0) {
      // Add main product image
      if (product.mainImage) {
        images.push(product.mainImage);
      }

      // Add additional product images
      images.push(...(product.additionalImages || []));
    }

    return images;
  }, [product, selectedSize]);

  // Derive current pricing and discount details
  const currentPriceDetails = useMemo(() => {
    // If product has sizes and a size is selected, use size details
    if (product?.sizes && product.sizes.length > 0 && selectedSize) {
      return {
        price: selectedSize.price,
        finalPrice: selectedSize.finalPrice,
        discountType: selectedSize.discountType,
        discountValue: selectedSize.discountValue,
        discountStartDate: selectedSize.discountStartDate,
        discountEndDate: selectedSize.discountEndDate,
        promotionStatus: selectedSize.promotionStatus,
      };
    }

    // Fallback to product-level details
    return {
      price: product?.price,
      finalPrice: product?.finalPrice,
      discountType: product?.discountType,
      discountValue: product?.discountValue,
      discountStartDate: product?.discountStartDate,
      discountEndDate: product?.discountEndDate,
      promotionStatus: product?.promotionStatus,
    };
  }, [product, selectedSize]);

  // Check if discount is active
  const isDiscountActive = (
    discountStartDate?: string | null,
    discountEndDate?: string | null
  ) => {
    if (!discountStartDate || !discountEndDate) return false;

    const now = new Date();
    const startDate = new Date(discountStartDate);
    const endDate = new Date(discountEndDate);

    return now >= startDate && now <= endDate;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="container flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  // Render error state
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

  // If no product found
  if (!product) {
    return (
      <div className="container py-12">
        <Alert variant="default">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>No product found</AlertDescription>
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
    <div className="container-fluid py-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to products</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/dashboard/products/${product.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Product
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-12 gap-6">
        {/* Image Gallery */}
        <div className="md:col-span-5">
          <Card>
            <CardContent className="p-4">
              {getAllImages.length > 0 ? (
                <Carousel>
                  <CarouselContent>
                    {getAllImages.map((image, index) => (
                      <CarouselItem key={image.id || `image-${index}`}>
                        <div className="aspect-square relative w-full">
                          <Image
                            src={`${BASE_URL_API}${image.url}`}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {getAllImages.length > 1 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Product Information */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{product.name}</CardTitle>
                  <CardDescription>#{product.id}</CardDescription>
                </div>
                <Badge
                  variant={
                    product.status === "ACTIVE" ? "default" : "destructive"
                  }
                >
                  {product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>Category ID: {product.categoryId}</span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground">{product.description}</p>

              {/* Size Variants Section */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-base font-medium">Available Sizes</h3>
                  <div className="flex flex-wrap gap-2 items-center">
                    {product.sizes.map((size) => (
                      <div key={size.id} className="flex flex-col items-center">
                        <Button
                          variant={
                            selectedSize?.id === size.id ? "default" : "outline"
                          }
                          onClick={() => setSelectedSize(size)}
                          disabled={size.status === "INACTIVE"}
                          className={`${
                            size.status === "INACTIVE"
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {size.size}
                        </Button>
                        {selectedSize?.id === size.id && (
                          <span className="text-xs text-muted-foreground mt-1">
                            Selected Size
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing Section */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">
                    ${currentPriceDetails.price?.toFixed(2)}
                  </span>
                  {currentPriceDetails.discountType &&
                    isDiscountActive(
                      currentPriceDetails.discountStartDate,
                      currentPriceDetails.discountEndDate
                    ) && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Percent className="h-3 w-3" />
                          {currentPriceDetails.discountType === "PERCENTAGE"
                            ? `${currentPriceDetails.discountValue}%`
                            : `$${currentPriceDetails.discountValue} off`}
                        </Badge>
                        <span className="text-muted-foreground">
                          Final Price: $
                          {currentPriceDetails.finalPrice?.toFixed(2)}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Discount Information */}
              {currentPriceDetails.discountType &&
                isDiscountActive(
                  currentPriceDetails.discountStartDate,
                  currentPriceDetails.discountEndDate
                ) && (
                  <div className="bg-muted/30 p-3 rounded-lg flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Promotional Discount Active</p>
                      <p className="text-xs text-muted-foreground">
                        Valid from {currentPriceDetails.discountStartDate} to{" "}
                        {currentPriceDetails.discountEndDate}
                      </p>
                    </div>
                  </div>
                )}

              {/* Additional Product Info */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Shop ID</p>
                  <p>{product.shopId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created At</p>
                  <p>{new Date(product.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Updated At</p>
                  <p>
                    {product.updatedAt
                      ? new Date(product.updatedAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
