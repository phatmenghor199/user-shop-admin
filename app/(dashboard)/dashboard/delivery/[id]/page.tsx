import Link from "next/link"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would normally come from a database
const deliveryMethod = {
  id: "DEL-001",
  name: "Standard Shipping",
  description: "Regular shipping option with standard delivery times",
  price: 5.99,
  estimatedDays: "3-5",
  isActive: true,
  isDefault: true,
  zones: ["Domestic"],
  dateAdded: "2023-01-15",
  lastUpdated: "2023-03-20",
}

export default function DeliveryMethodDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/delivery">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to delivery methods</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{deliveryMethod.name}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/delivery/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Delivery Method
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Delivery Method
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Method Information</CardTitle>
          <CardDescription>Detailed information about this delivery method.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Method ID</h3>
              <p>{deliveryMethod.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
              <p className="text-sm">{deliveryMethod.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                <p className="text-lg font-semibold">
                  {deliveryMethod.price === 0 ? "Free" : `$${deliveryMethod.price.toFixed(2)}`}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <Badge variant={deliveryMethod.isActive ? "default" : "outline"}>
                  {deliveryMethod.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estimated Delivery Time</h3>
                <p>{deliveryMethod.estimatedDays === "0" ? "Same day" : `${deliveryMethod.estimatedDays} days`}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Default Method</h3>
                <p>{deliveryMethod.isDefault ? "Yes" : "No"}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Available Zones</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {deliveryMethod.zones.map((zone) => (
                  <Badge key={zone} variant="secondary">
                    {zone}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                <p>{deliveryMethod.dateAdded}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>{deliveryMethod.lastUpdated}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

