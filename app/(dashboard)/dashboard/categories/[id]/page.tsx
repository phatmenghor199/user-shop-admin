import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would normally come from a database
const category = {
  id: "CAT-001",
  name: "Electronics",
  slug: "electronics",
  description: "Electronic devices and gadgets",
  image: "/placeholder.svg?height=400&width=400",
  productsCount: 120,
  isActive: true,
  parentCategory: null,
  featured: true,
  subcategories: [
    {
      id: "CAT-002",
      name: "Smartphones",
      slug: "smartphones",
      productsCount: 45,
    },
    {
      id: "CAT-003",
      name: "Laptops",
      slug: "laptops",
      productsCount: 35,
    },
    {
      id: "CAT-010",
      name: "Audio Devices",
      slug: "audio-devices",
      productsCount: 28,
    },
  ],
  dateAdded: "2023-01-15",
  lastUpdated: "2023-03-20",
}

export default function CategoryDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to categories</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{category.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/categories/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Category
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
            <CardDescription>Detailed information about this category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Category ID</h3>
                <p>{category.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{category.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Slug</h3>
                  <p>{category.slug}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge variant={category.isActive ? "default" : "outline"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Parent Category</h3>
                  <p>{category.parentCategory ? category.parentCategory : "None (Main Category)"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
                  <p>{category.productsCount} products</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Featured</h3>
                  <p>{category.featured ? "Yes" : "No"}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                  <p>{category.dateAdded}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p>{category.lastUpdated}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {category.subcategories && category.subcategories.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>Categories that belong to {category.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {category.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  href={`/dashboard/categories/${subcategory.id}`}
                  className="rounded-lg border p-4 transition-colors hover:bg-accent"
                >
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{subcategory.slug}</span>
                    <Badge variant="outline">{subcategory.productsCount} products</Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

