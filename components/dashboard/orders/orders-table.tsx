"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter, X, Eye, FileText, Truck, Ban } from "lucide-react"

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Sample orders data
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
    items: 3,
    paymentMethod: "Credit Card",
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
    items: 1,
    paymentMethod: "PayPal",
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
    items: 5,
    paymentMethod: "Credit Card",
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
    items: 2,
    paymentMethod: "Credit Card",
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
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-006",
    customer: {
      name: "Jennifer Lee",
      email: "jennifer.l@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JL",
    },
    status: "processing",
    date: "2023-03-30",
    total: "$189.50",
    items: 4,
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-007",
    customer: {
      name: "David Miller",
      email: "david.m@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "DM",
    },
    status: "pending",
    date: "2023-03-30",
    total: "$45.99",
    items: 1,
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-008",
    customer: {
      name: "Lisa Anderson",
      email: "lisa.a@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "LA",
    },
    status: "completed",
    date: "2023-03-29",
    total: "$299.99",
    items: 3,
    paymentMethod: "Credit Card",
  },
  {
    id: "ORD-009",
    customer: {
      name: "Thomas White",
      email: "thomas.w@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "TW",
    },
    status: "cancelled",
    date: "2023-03-29",
    total: "$89.95",
    items: 2,
    paymentMethod: "PayPal",
  },
  {
    id: "ORD-010",
    customer: {
      name: "Jessica Taylor",
      email: "jessica.t@example.com",
      avatar: "/placeholder.svg?height=32&width=32",
      initials: "JT",
    },
    status: "completed",
    date: "2023-03-28",
    total: "$129.99",
    items: 2,
    paymentMethod: "Credit Card",
  },
]

interface OrdersTableProps {
  status: string
}

export function OrdersTable({ status }: OrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter orders based on status and search query
  const filteredOrders = orders.filter(
    (order) =>
      (status === "all" || order.status === status) &&
      (order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search orders..."
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
                <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Today</DropdownMenuItem>
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem>Custom range</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Payment</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Credit Card</DropdownMenuItem>
                <DropdownMenuItem>PayPal</DropdownMenuItem>
                <DropdownMenuItem>Bank Transfer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Order ID</TableHead>
                <TableHead>
                  <div className="flex items-center space-x-1">
                    <span>Customer</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                          <AvatarFallback>{order.customer.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{order.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{order.customer.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell className="text-right">{order.total}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
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
                            <Link href={`/dashboard/orders/${order.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Invoice
                          </DropdownMenuItem>
                          {order.status !== "completed" && order.status !== "cancelled" && (
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          )}
                          {order.status !== "cancelled" && <DropdownMenuSeparator />}
                          {order.status !== "cancelled" && (
                            <DropdownMenuItem className="text-destructive">
                              <Ban className="mr-2 h-4 w-4" />
                              Cancel Order
                            </DropdownMenuItem>
                          )}
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

