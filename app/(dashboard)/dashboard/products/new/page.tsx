"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, Save, UploadCloud, X, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

// Define the size variant type
type SizeVariant = {
  id: string
  name: string
  price: number
  stock: number
  image: string | null
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Product name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  stock: z.coerce.number().int().nonnegative({
    message: "Stock must be a non-negative integer.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  barcode: z.string().optional(),
  weight: z.coerce.number().positive({
    message: "Weight must be a positive number.",
  }),
  length: z.coerce.number().positive({
    message: "Length must be a positive number.",
  }),
  width: z.coerce.number().positive({
    message: "Width must be a positive number.",
  }),
  height: z.coerce.number().positive({
    message: "Height must be a positive number.",
  }),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  hasSizes: z.boolean().default(false),
})

// Sample categories for the dropdown
const categories = [
  { id: "electronics", name: "Electronics" },
  { id: "clothing", name: "Clothing" },
  { id: "accessories", name: "Accessories" },
  { id: "home", name: "Home & Kitchen" },
  { id: "sports", name: "Sports" },
]

export default function NewProductPage() {
  const [images, setImages] = useState<string[]>([])
  const [sizeVariants, setSizeVariants] = useState<SizeVariant[]>([])
  const [hasSizes, setHasSizes] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: 0,
      stock: 0,
      sku: "",
      barcode: "",
      weight: 0,
      length: 0,
      width: 0,
      height: 0,
      isActive: true,
      isFeatured: false,
      hasSizes: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Combine the form values with size variants if applicable
    const productData = {
      ...values,
      sizeVariants: hasSizes ? sizeVariants : [],
      images,
    }

    console.log(productData)
    toast({
      title: "Product created",
      description: "Your product has been created successfully.",
    })
    router.push("/dashboard/products")
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages([...(reader.result as string), ...images])
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSizeVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>, variantId: string) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSizeVariants((variants) =>
          variants.map((variant) =>
            variant.id === variantId ? { ...variant, image: reader.result as string } : variant,
          ),
        )
      }
      reader.readAsDataURL(file)
    }
  }

  const addSizeVariant = () => {
    const newVariant: SizeVariant = {
      id: `size-${Date.now()}`,
      name: "",
      price: form.getValues().price || 0,
      stock: form.getValues().stock || 0,
      image: null,
    }
    setSizeVariants([...sizeVariants, newVariant])
  }

  const removeSizeVariant = (variantId: string) => {
    setSizeVariants(sizeVariants.filter((variant) => variant.id !== variantId))
  }

  const updateSizeVariant = (variantId: string, field: keyof SizeVariant, value: any) => {
    setSizeVariants((variants) =>
      variants.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)),
    )
  }

  // Toggle size variants feature
  const toggleSizeVariants = (value: boolean) => {
    setHasSizes(value)
    form.setValue("hasSizes", value)

    // Add a default size variant if enabling and none exist
    if (value && sizeVariants.length === 0) {
      addSizeVariant()
    }
  }

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
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="sizes">Sizes & Variants</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the basic information of your product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter product name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter product description" className="min-h-[120px]" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Active Status</FormLabel>
                              <FormDescription>Make this product visible on the store.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Featured Product</FormLabel>
                              <FormDescription>Show this product in featured sections.</FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="hasSizes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Product Has Size Variants</FormLabel>
                            <FormDescription>
                              Enable if this product comes in different sizes with different prices.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(value) => {
                                field.onChange(value)
                                toggleSizeVariants(value)
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload images for your product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      {images.map((image, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-lg border">
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`Product image ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute right-2 top-2 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove image</span>
                          </Button>
                        </div>
                      ))}
                      <div className="flex aspect-square flex-col items-center justify-center rounded-lg border border-dashed">
                        <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                        <p className="text-sm font-medium">Upload Image</p>
                        <p className="text-xs text-muted-foreground">Drag and drop or click to upload</p>
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 cursor-pointer opacity-0"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium">Image Requirements</h3>
                      <ul className="list-inside list-disc text-sm text-muted-foreground">
                        <li>File formats: JPG, PNG, or WebP</li>
                        <li>Maximum file size: 2MB</li>
                        <li>Recommended aspect ratio: 1:1 (square)</li>
                        <li>Minimum dimensions: 800 x 800 pixels</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Information</CardTitle>
                  <CardDescription>Enter inventory details for your product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="stock"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock Quantity</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="1" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SKU (Stock Keeping Unit)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter SKU" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="barcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Barcode (ISBN, UPC, GTIN, etc.)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter barcode (optional)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sizes">
              <Card>
                <CardHeader>
                  <CardTitle>Size Variants</CardTitle>
                  <CardDescription>
                    {hasSizes
                      ? "Manage different sizes and their specific prices, stock, and images."
                      : "Enable size variants in the Basic Information tab to manage different sizes."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!hasSizes ? (
                    <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground">Size variants are disabled</p>
                      <Button variant="outline" className="mt-4" onClick={() => toggleSizeVariants(true)}>
                        Enable Size Variants
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {sizeVariants.map((variant, index) => (
                        <div key={variant.id} className="rounded-lg border p-4">
                          <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-medium">Size Variant {index + 1}</h3>
                            <Button variant="ghost" size="icon" onClick={() => removeSizeVariant(variant.id)}>
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4">
                              <div>
                                <FormLabel>Size Name</FormLabel>
                                <Input
                                  placeholder="e.g., Small, Medium, Large, XL"
                                  value={variant.name}
                                  onChange={(e) => updateSizeVariant(variant.id, "name", e.target.value)}
                                />
                              </div>

                              <div>
                                <FormLabel>Price</FormLabel>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={variant.price}
                                  onChange={(e) =>
                                    updateSizeVariant(variant.id, "price", Number.parseFloat(e.target.value))
                                  }
                                />
                              </div>

                              <div>
                                <FormLabel>Stock</FormLabel>
                                <Input
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="0"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    updateSizeVariant(variant.id, "stock", Number.parseInt(e.target.value))
                                  }
                                />
                              </div>
                            </div>

                            <div className="flex flex-col items-center justify-center">
                              <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border">
                                {variant.image ? (
                                  <>
                                    <Image
                                      src={variant.image || "/placeholder.svg"}
                                      alt={`Size variant ${variant.name}`}
                                      fill
                                      className="object-cover"
                                    />
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      className="absolute right-2 top-2"
                                      onClick={() => updateSizeVariant(variant.id, "image", null)}
                                    >
                                      Change
                                    </Button>
                                  </>
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center">
                                    <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">Upload size image</p>
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      className="absolute inset-0 cursor-pointer opacity-0"
                                      onChange={(e) => handleSizeVariantImageUpload(e, variant.id)}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button variant="outline" className="w-full" onClick={addSizeVariant}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Size
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                  <CardDescription>Enter shipping details for your product.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Product weight in kilograms.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="length"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Length (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.1" placeholder="0.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Width (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.1" placeholder="0.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input type="number" min="0" step="0.1" placeholder="0.0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/products">Cancel</Link>
              </Button>
              <Button type="submit" className="gap-1">
                <Save className="h-4 w-4" />
                Create Product
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  )
}

