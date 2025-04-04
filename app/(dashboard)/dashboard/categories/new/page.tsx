"use client"

import React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ImageIcon, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "Slug must be at least 2 characters.",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().optional(),
  parentCategory: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

// Sample parent categories for the dropdown
const parentCategories = [
  { id: "CAT-001", name: "Electronics" },
  { id: "CAT-004", name: "Clothing" },
  { id: "CAT-007", name: "Home & Kitchen" },
]

export default function NewCategoryPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const parentId = searchParams.get("parent")
  const { toast } = useToast()

  // Find parent category name if parentId is provided
  const parentCategory = parentId ? parentCategories.find((cat) => cat.id === parentId) : null

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      parentCategory: parentCategory?.id || "",
      isActive: true,
      isFeatured: false,
    },
  })

  // Auto-generate slug from name
  const watchName = form.watch("name")
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
  }

  // Update slug when name changes
  React.useEffect(() => {
    if (watchName) {
      form.setValue("slug", generateSlug(watchName))
    }
  }, [watchName, form])

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would call your API to create the category
    console.log(values)

    toast({
      title: "Category created",
      description: "Your category has been created successfully.",
    })

    router.push("/dashboard/categories")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {parentCategory ? `Add Subcategory to ${parentCategory.name}` : "Add New Category"}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Category Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter category name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="category-slug" {...field} />
                      </FormControl>
                      <FormDescription>
                        The slug is used in the URL for this category. It should contain only lowercase letters,
                        numbers, and hyphens.
                      </FormDescription>
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
                          placeholder="Enter category description (optional)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!parentCategory && (
                  <FormField
                    control={form.control}
                    name="parentCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parent Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a parent category (optional)" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None (Main Category)</SelectItem>
                            {parentCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>Leave empty to create a main category.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active Status</FormLabel>
                          <FormDescription>Make this category visible on the store.</FormDescription>
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
                          <FormLabel className="text-base">Featured</FormLabel>
                          <FormDescription>Show this category in featured sections.</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Category</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                {imagePreview ? (
                  <div className="relative aspect-square w-40 overflow-hidden rounded-lg">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Category preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={() => setImagePreview(null)}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Drag and drop your category image here</p>
                      <p className="text-xs text-muted-foreground">Recommended size: 512 x 512 pixels</p>
                    </div>
                    <Button variant="secondary" className="gap-2">
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload Image</span>
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageChange}
                      />
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Image Requirements</h3>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  <li>File formats: JPG, PNG, or WebP</li>
                  <li>Maximum file size: 1MB</li>
                  <li>Recommended aspect ratio: 1:1 (square)</li>
                  <li>Minimum dimensions: 512 x 512 pixels</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

