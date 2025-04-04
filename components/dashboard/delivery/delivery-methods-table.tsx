"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter, X, Eye, Edit, Trash2, Power } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Sample delivery methods data
const deliveryMethods = [
  {
    id: "DEL-001",
    name: "Standard Shipping",
    price: 5.99,
    estimatedDays: "3-5",
    isActive: true,
    isDefault: true,
    zones: ["Domestic"],
  },
  {
    id: "DEL-002",
    name: "Express Shipping",
    price: 12.99,
    estimatedDays: "1-2",
    isActive: true,
    isDefault: false,
    zones: ["Domestic"],
  },
  {
    id: "DEL-003",
    name: "Next Day Delivery",
    price: 19.99,
    estimatedDays: "1",
    isActive: true,
    isDefault: false,
    zones: ["Domestic"],
  },
  {
    id: "DEL-004",
    name: "International Standard",
    price: 15.99,
    estimatedDays: "7-10",
    isActive: true,
    isDefault: false,
    zones: ["International"],
  },
  {
    id: "DEL-005",
    name: "International Express",
    price: 29.99,
    estimatedDays: "3-5",
    isActive: true,
    isDefault: false,
    zones: ["International"],
  },
  {
    id: "DEL-006",
    name: "Local Pickup",
    price: 0,
    estimatedDays: "0",
    isActive: true,
    isDefault: false,
    zones: ["Local"],
  },
  {
    id: "DEL-007",
    name: "Same Day Delivery",
    price: 24.99,
    estimatedDays: "0",
    isActive: false,
    isDefault: false,
    zones: ["Local"],
  },
]

export function DeliveryMethodsTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [deliveryData, setDeliveryData] = useState(deliveryMethods)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter delivery methods based on search query
  const filteredMethods = deliveryData.filter(
    (method) =>
      method.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      method.zones.some((zone) => zone.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredMethods.length / itemsPerPage)
  const paginatedMethods = filteredMethods.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Toggle delivery method status
  const toggleMethodStatus = (id: string) => {
    setDeliveryData((prev) =>
      prev.map((method) => (method.id === id ? { ...method, isActive: !method.isActive } : method)),
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search delivery methods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-full md:w-[300px]"
            />
            {searchQuery && (
              <Button variant="ghost" size="icon" onClick={() => setSearchQuery("")} className="h-9 w-9">
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-1">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filter</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[200px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Inactive</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Zone</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Domestic</DropdownMenuItem>
                <DropdownMenuItem>International</DropdownMenuItem>
                <DropdownMenuItem>Local</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Method Name</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Estimated Days</TableHead>
                <TableHead>Zones</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMethods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No delivery methods found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.id}</TableCell>
                    <TableCell>{method.name}</TableCell>
                    <TableCell className="text-right">
                      {method.price === 0 ? "Free" : `$${method.price.toFixed(2)}`}
                    </TableCell>
                    <TableCell>{method.estimatedDays === "0" ? "Same day" : `${method.estimatedDays} days`}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {method.zones.map((zone) => (
                          <Badge key={zone} variant="outline" className="capitalize">
                            {zone}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{method.isDefault && <Badge variant="secondary">Default</Badge>}</TableCell>
                    <TableCell>
                      <Switch checked={method.isActive} onCheckedChange={() => toggleMethodStatus(method.id)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/delivery/${method.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/delivery/${method.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Power className="mr-2 h-4 w-4" />
                            {method.isActive ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="border-t p-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let pageNumber: number

                // Logic to show correct page numbers when there are many pages
                if (totalPages <= 5) {
                  pageNumber = i + 1
                } else if (currentPage <= 3) {
                  pageNumber = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i
                } else {
                  pageNumber = currentPage - 2 + i
                }

                if (pageNumber > 0 && pageNumber <= totalPages) {
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink isActive={currentPage === pageNumber} onClick={() => setCurrentPage(pageNumber)}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  )
}

