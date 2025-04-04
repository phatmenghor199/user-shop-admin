import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { BannersTable } from "@/components/dashboard/banners/banners-table"

export default function BannersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
        <Button asChild>
          <Link href="/dashboard/banners/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Banner
          </Link>
        </Button>
      </div>

      <BannersTable />
    </div>
  )
}

