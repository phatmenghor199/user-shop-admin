"use client"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Method name must be at least 2 characters.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  estimatedDays: z.string().min(1, {
    message: "Please enter estimated delivery time.",
  }),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  zones: z.array(z.string()).min(1, {
    message: "Please select at least one delivery zone.",
  }),
})

// Sample delivery zones
const deliveryZones = [
  { id: "domestic", label: "Domestic" },
  { id: "international", label: "International" },
  { id: "local", label: "Local" },
]

export default function NewDeliveryMethodPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      estimatedDays: "",
      description: "",
      isActive: true,
      isDefault: false,
      zones: [],
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would call your API to create the delivery method
    console.log(values)

    toast({
      title: "Delivery method created",
      description: "Your delivery method has been created successfully.",
    })

    router.push("/dashboard/delivery")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Add New Delivery Method</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Method Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Method Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter delivery method name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormDescription>Enter 0 for free delivery.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Delivery Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3-5 days, 24 hours" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the estimated delivery time (e.g., "3-5 days", "24 hours").
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
                          placeholder="Enter delivery method description (optional)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="zones"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Delivery Zones</FormLabel>
                      <FormDescription>Select the zones where this delivery method is available.</FormDescription>
                    </div>
                    <div className="grid gap-2 md:grid-cols-3">
                      {deliveryZones.map((zone) => (
                        <FormField
                          key={zone.id}
                          control={form.control}
                          name="zones"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={zone.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(zone.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, zone.id])
                                        : field.onChange(field.value?.filter((value) => value !== zone.id))
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">{zone.label}</FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
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
                        <FormDescription>Make this delivery method available for customers.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Default Method</FormLabel>
                        <FormDescription>Set as the default delivery method at checkout.</FormDescription>
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
                <Button type="submit">Create Delivery Method</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

