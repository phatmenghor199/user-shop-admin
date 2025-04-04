import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// This would normally come from a database
const banner = {
  id: "BNR-001",
  title: "Summer Sale",
  description: "Promotional banner for the summer sale event",
  image: "/placeholder.svg?height=400&width=1200",
  position: "Home Top",
  url: "https://example.com/summer-sale",
  startDate: "2023-06-01",
  endDate: "2023-08-31",
  status: "active",
  isActive: true,
  dateAdded: "2023-05-15",
  lastUpdated: "2023-05-20",
}

export default function BannerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/banners">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to banners</span>
            </Link>
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">{banner.title}</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/banners/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Banner
            </Link>
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Banner
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[3/1] overflow-hidden rounded-lg border">
              <Image src={banner.image || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
            <CardDescription>Detailed information about this banner.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Banner ID</h3>
                <p>{banner.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-sm">{banner.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Position</h3>
                  <p>{banner.position}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Badge
                    variant={
                      banner.status === "active" ? "default" : banner.status === "scheduled" ? "secondary" : "outline"
                    }
                    className="capitalize"
                  >
                    {banner.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">URL</h3>
                <p className="text-sm break-all">{banner.url}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                  <p>{banner.startDate}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                  <p>{banner.endDate}</p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date Added</h3>
                  <p>{banner.dateAdded}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                  <p>{banner.lastUpdated}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

