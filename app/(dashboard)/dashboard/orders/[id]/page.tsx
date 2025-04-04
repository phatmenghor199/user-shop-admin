import Link from "next/link"
import { ArrowLeft, FileText, Truck, Ban } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// This would normally come from a database
const order = {
  id: "ORD-001",
  customer: {
    name: "John Smith",
    email: "john.smith@example.com",
    avatar: "/placeholder.svg?height=32&width=32",
    initials: "JS",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, Anytown, USA, 12345",
  },
  status: "completed",
  date: "2023-04-01",
  total: 129.99,
  subtotal: 119.99,
  tax: 10.0,
  shipping: 0.0,
  paymentMethod: "Credit Card",
  paymentId: "PAY-12345",
  items: [
    {
      id: "PROD-001",
      name: "Premium Wireless Headphones",
      price: 79.99,
      quantity: 1,
      image: "/placeholder.svg?height=50&width=50",
    },
    {
      id: "PROD-002",
      name: "Smartphone Case",
      price: 19.99,
      quantity: 2,
      image: "/placeholder.svg?height=50&width=50",
    },
  ],
  shippingMethod: "Standard Shipping",
  trackingNumber: "TRK-12345",
  notes: "Please leave package at the front door",
  dateAdded: "2023-04-01",
  lastUpdated: "2023-04-02",
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to orders</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Order {order.id}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <FileText className="h-4 w-4" />
            Generate Invoice
          </Button>
          {order.status !== "completed" && order.status !== "cancelled" && (
            <Button variant="outline" className="gap-1">
              <Truck className="h-4 w-4" />
              Update Status
            </Button>
          )}
          {order.status !== "cancelled" && (
            <Button variant="destructive" className="gap-1">
              <Ban className="h-4 w-4" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>Detailed information about this order.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order ID</h3>
                  <p className="font-medium">{order.id}</p>
                </div>
                <Badge
                  variant={
                    order.status === "completed"
                      ? "default"
                      : order.status === "processing"
                        ? "secondary"
                        : order.status === "pending"
                          ? "outline"
                          : "destructive"
                  }
                  className="capitalize"
                >
                  {order.status}
                </Badge>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date Placed</h3>
                  <p>{order.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p>{order.lastUpdated}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">Order Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                              <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover" />
                            </div>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.id}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <p>{order.paymentMethod}</p>
                  <p className="text-xs text-muted-foreground">Payment ID: {order.paymentId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Shipping Method</h3>
                  <p>{order.shippingMethod}</p>
                  {order.trackingNumber && (
                    <p className="text-xs text-muted-foreground">Tracking: {order.trackingNumber}</p>
                  )}
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Order Notes</h3>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                  <AvatarFallback>{order.customer.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contact Information</h3>
                <p className="text-sm">{order.customer.email}</p>
                <p className="text-sm">{order.customer.phone}</p>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Shipping Address</h3>
                <p className="text-sm whitespace-pre-line">{order.customer.address}</p>
              </div>

              <Separator />

              <div className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/customers/${order.customer.email}`}>View Customer</Link>
                </Button>
                <Button variant="outline">Customer Orders</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

