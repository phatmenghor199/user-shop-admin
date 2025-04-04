"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, CalendarIcon, ImageIcon, Save, Trash2, UploadCloud } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  position: z.string({
    required_error: "Please select a position.",
  }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  startDate: z.date({
    required_error: "Start date is required.",
  }),
  endDate: z.date({
    required_error: "End date is required.",
  }),
  isActive: z.boolean().default(false),
})

// This would normally come from a database
const banner = {
  id: "BNR-001",
  title: "Summer Sale",
  description: "Promotional banner for the summer sale event",
  image: "/placeholder.svg?height=400&width=1200",
  position: "home_top",
  url: "https://example.com/summer-sale",
  startDate: new Date("2023-06-01"),
  endDate: new Date("2023-08-31"),
  isActive: true,
}

export default function EditBannerPage({ params }: { params: { id: string } }) {
  const [imagePreview, setImagePreview] = useState<string | null>(banner.image)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: banner.title,
      description: banner.description,
      position: banner.position,
      url: banner.url,
      startDate: banner.startDate,
      endDate: banner.endDate,
      isActive: banner.isActive,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would call your API to update the banner
    console.log(values)

    toast({
      title: "Banner updated",
      description: "Your banner has been updated successfully.",
    })

    router.push(`/dashboard/banners/${params.id}`)
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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/banners/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to banner</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Edit Banner</h2>
        </div>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Banner
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter banner title" {...field} />
                      </FormControl>
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
                          placeholder="Enter banner description (optional)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select banner position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="home_top">Home Top</SelectItem>
                          <SelectItem value="home_middle">Home Middle</SelectItem>
                          <SelectItem value="home_bottom">Home Bottom</SelectItem>
                          <SelectItem value="category_page">Category Page</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/page" {...field} />
                      </FormControl>
                      <FormDescription>
                        The URL where users will be directed when they click the banner.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? field.value.toLocaleDateString() : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? field.value.toLocaleDateString() : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <FormDescription>Make this banner active immediately after updating.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" asChild>
                    <Link href={`/dashboard/banners/${params.id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" className="gap-1">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                {imagePreview ? (
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
                    <Image
                      src={imagePreview || "/placeholder.svg"}
                      alt="Banner preview"
                      fill
                      className="object-cover"
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
                      <p className="text-sm font-medium">Drag and drop your banner image here</p>
                      <p className="text-xs text-muted-foreground">Recommended size: 1200 x 400 pixels (3:1 ratio)</p>
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
                  <li>Maximum file size: 2MB</li>
                  <li>Recommended aspect ratio: 3:1</li>
                  <li>Minimum width: 1200 pixels</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

