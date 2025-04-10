"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductsTable } from "@/components/dashboard/products/products-table";
import { useTranslation } from "@/language/translation-provider";

export default function ProductsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("app.products")}
        </h1>

        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/products/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsTable />
    </div>
  );
}
