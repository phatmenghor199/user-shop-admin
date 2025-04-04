import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would normally come from a database
const product = {
  id: "PROD-001",
  name: "Premium Wireless Headphones",
  description:
    "High-quality wireless headphones with noise cancellation technology, providing an immersive audio experience. Features include Bluetooth 5.0 connectivity, 30-hour battery life, and comfortable over-ear design.",
  category: "Electronics",
  price: 129.99,
  stock: 45,
  status: "In Stock",
  sku: "HDP-001-BLK",
  barcode: "8901234567890",
  weight: "0.3 kg",
  dimensions: "18 × 15 × 8 cm",
  images: [
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
    "/placeholder.svg?height=400&width=400",
  ],
  variants: [
    { name: "Color", value: "Black" },
    { name: "Connectivity", value: "Bluetooth 5.0" },
  ],
  dateAdded: "2023-01-15",
  lastUpdated: "2023-03-20",
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
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
          <h2 className="text-3xl font-bold tracking-tight">{product.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/products/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Product
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="relative aspect-square overflow-hidden rounded-lg border">
                <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {product.images.map((image, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Detailed information about this product.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Product ID</h3>
                <p>{product.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                  <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant={
                      product.status === "In Stock"
                        ? "default"
                        : product.status === "Low Stock"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {product.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                  <p>{product.category}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Stock</h3>
                  <p>{product.stock} units</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">SKU</h3>
                  <p>{product.sku}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Barcode</h3>
                  <p>{product.barcode}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Weight</h3>
                  <p>{product.weight}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Dimensions</h3>
                  <p>{product.dimensions}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Variants</h3>
                <div className="mt-2 space-y-2">
                  {product.variants.map((variant, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{variant.name}</span>
                      <span className="text-sm font-medium">{variant.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                  <p>{product.dateAdded}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p>{product.lastUpdated}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

