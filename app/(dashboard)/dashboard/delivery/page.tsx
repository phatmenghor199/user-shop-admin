import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DeliveryMethodsTable } from "@/components/dashboard/delivery/delivery-methods-table"

export default function DeliveryMethodsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Delivery Methods</h2>
        <Button asChild>
          <Link href="/dashboard/delivery/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Delivery Method
          </Link>
        </Button>
      </div>

      <DeliveryMethodsTable />
    </div>
  )
}

