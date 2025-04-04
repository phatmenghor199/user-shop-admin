"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { MoreHorizontal, ArrowUpDown, ChevronDown, Filter, X, Eye, Edit, Trash2, Plus } from "lucide-react"

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

// Sample categories data
const categories = [
  {
    id: "CAT-001",
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and gadgets",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 120,
    isActive: true,
    parentCategory: null,
    featured: true,
  },
  {
    id: "CAT-002",
    name: "Smartphones",
    slug: "smartphones",
    description: "Mobile phones and accessories",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 45,
    isActive: true,
    parentCategory: "Electronics",
    featured: true,
  },
  {
    id: "CAT-003",
    name: "Laptops",
    slug: "laptops",
    description: "Notebook computers and accessories",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 35,
    isActive: true,
    parentCategory: "Electronics",
    featured: false,
  },
  {
    id: "CAT-004",
    name: "Clothing",
    slug: "clothing",
    description: "Apparel and fashion items",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 200,
    isActive: true,
    parentCategory: null,
    featured: true,
  },
  {
    id: "CAT-005",
    name: "Men's Clothing",
    slug: "mens-clothing",
    description: "Clothing for men",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 85,
    isActive: true,
    parentCategory: "Clothing",
    featured: false,
  },
  {
    id: "CAT-006",
    name: "Women's Clothing",
    slug: "womens-clothing",
    description: "Clothing for women",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 115,
    isActive: true,
    parentCategory: "Clothing",
    featured: true,
  },
  {
    id: "CAT-007",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    description: "Home and kitchen products",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 150,
    isActive: true,
    parentCategory: null,
    featured: false,
  },
  {
    id: "CAT-008",
    name: "Furniture",
    slug: "furniture",
    description: "Furniture for home and office",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 60,
    isActive: true,
    parentCategory: "Home & Kitchen",
    featured: false,
  },
  {
    id: "CAT-009",
    name: "Appliances",
    slug: "appliances",
    description: "Kitchen and home appliances",
    image: "/placeholder.svg?height=40&width=40",
    productsCount: 40,
    isActive: false,
    parentCategory: "Home & Kitchen",
    featured: false,
  },
]

export function CategoriesTable() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryData, setCategoryData] = useState(categories)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Filter categories based on search query
  const filteredCategories = categoryData.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.parentCategory && category.parentCategory.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage)
  const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Toggle category status
  const toggleCategoryStatus = (id: string) => {
    setCategoryData((prev) =>
      prev.map((category) => (category.id === id ? { ...category, isActive: !category.isActive } : category)),
    )
  }

  // Toggle featured status
  const toggleFeaturedStatus = (id: string) => {
    setCategoryData((prev) =>
      prev.map((category) => (category.id === id ? { ...category, featured: !category.featured } : category)),
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex flex-1 items-center space-x-2">
            <Input
              placeholder="Search categories..."
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
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Parent Categories</DropdownMenuItem>
                <DropdownMenuItem>Sub Categories</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Featured</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Featured</DropdownMenuItem>
                <DropdownMenuItem>Not Featured</DropdownMenuItem>
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
                    <span>Category</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Parent</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md border">
                          <Image
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className="text-xs text-muted-foreground">{category.slug}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {category.parentCategory ? (
                        <Badge variant="outline">{category.parentCategory}</Badge>
                      ) : (
                        <Badge variant="secondary">Main Category</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{category.productsCount}</TableCell>
                    <TableCell>
                      <Switch checked={category.featured} onCheckedChange={() => toggleFeaturedStatus(category.id)} />
                    </TableCell>
                    <TableCell>
                      <Switch checked={category.isActive} onCheckedChange={() => toggleCategoryStatus(category.id)} />
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
                            <Link href={`/dashboard/categories/${category.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/categories/${category.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          {!category.parentCategory && (
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/categories/new?parent=${category.id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Subcategory
                              </Link>
                            </DropdownMenuItem>
                          )}
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

