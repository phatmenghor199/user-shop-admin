import { Button } from "@/components/ui/button"
import { OrdersTable } from "@/components/dashboard/orders/orders-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <Button>Export Orders</Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrdersTable status="all" />
        </TabsContent>

        <TabsContent value="pending">
          <OrdersTable status="pending" />
        </TabsContent>

        <TabsContent value="processing">
          <OrdersTable status="processing" />
        </TabsContent>

        <TabsContent value="completed">
          <OrdersTable status="completed" />
        </TabsContent>

        <TabsContent value="cancelled">
          <OrdersTable status="cancelled" />
        </TabsContent>
      </Tabs>
    </div>
  )
}

