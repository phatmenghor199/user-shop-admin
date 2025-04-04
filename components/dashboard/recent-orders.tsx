import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function RecentOrders() {
  const orders = [
    {
      id: "ORD-001",
      customer: {
        name: "John Smith",
        email: "john.smith@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "JS",
      },
      status: "completed",
      date: "2023-04-01",
      total: "$129.99",
    },
    {
      id: "ORD-002",
      customer: {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "SJ",
      },
      status: "processing",
      date: "2023-04-01",
      total: "$79.95",
    },
    {
      id: "ORD-003",
      customer: {
        name: "Michael Brown",
        email: "m.brown@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "MB",
      },
      status: "pending",
      date: "2023-04-01",
      total: "$249.00",
    },
    {
      id: "ORD-004",
      customer: {
        name: "Emily Davis",
        email: "emily.d@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "ED",
      },
      status: "completed",
      date: "2023-03-31",
      total: "$149.99",
    },
    {
      id: "ORD-005",
      customer: {
        name: "Robert Wilson",
        email: "r.wilson@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        initials: "RW",
      },
      status: "cancelled",
      date: "2023-03-31",
      total: "$59.99",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {orders.map((order) => (
          <div key={order.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                <AvatarFallback>{order.customer.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{order.customer.name}</p>
                <p className="text-sm text-muted-foreground">{order.customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <div className="flex flex-col items-end">
                <p className="text-sm font-medium">{order.total}</p>
                <p className="text-xs text-muted-foreground">{order.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" className="w-full">
        View All Orders
      </Button>
    </div>
  )
}

