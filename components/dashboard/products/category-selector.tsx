import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { debounce } from "@/utils/function/deboune";
import { getAllCategoriesAdminService } from "@/services/dashboard/categories.service";

type Category = {
  id: number;
  name: string;
  status: string;
};

interface CategorySelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(false);
  const { toast } = useToast();

  // Intersection Observer Hook for infinite scrolling
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Find the selected category name
  const selectedCategory = categories.find(
    (cat) => cat.id.toString() === value
  );
  const selectedName = selectedCategory?.name || "";

  // Fetch categories with pagination and search
  const fetchCategories = async (search = "", newPage = 1) => {
    if (isLoading || (lastPage && newPage > 1)) return;

    setIsLoading(true);
    try {
      const requestBody = {
        pageNo: newPage,
        pageSize: 20,
        search: search || undefined,
        status: "ACTIVE",
      };

      const response = await getAllCategoriesAdminService(requestBody);

      if (Array.isArray(response.content)) {
        if (newPage === 1) {
          // Replace categories on first page
          setCategories(response.content);
        } else {
          // Append categories on subsequent pages
          setCategories((prev) => [...prev, ...response.content]);
        }

        // Check if there are more pages
        setLastPage(response.last);
        setPage(response.pageNo);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast({
        title: "Error",
        description: "Failed to load categories. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Load more when last item is visible
  useEffect(() => {
    if (inView && !lastPage && !isLoading) {
      fetchCategories(searchTerm, page + 1);
    }
  }, [inView, lastPage, isLoading, page, searchTerm]);

  // Handle search with debounce
  const handleSearch = useCallback(
    debounce((value: string) => {
      setPage(1);
      setLastPage(false);
      fetchCategories(value, 1);
    }, 500),
    []
  );

  const onSearchChange = (value: string) => {
    setSearchTerm(value);
    handleSearch(value);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedName || "Select a category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search categories..."
            value={searchTerm}
            onValueChange={onSearchChange}
          />
          <CommandList className="max-h-60 overflow-y-auto">
            <CommandEmpty>No categories found.</CommandEmpty>
            <CommandGroup>
              {categories.map((category, index) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    onChange(category.id.toString());
                    setOpen(false);
                  }}
                  ref={index === categories.length - 1 ? ref : null} // Attach observer to last item
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === category.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>

            {/* Loading indicator */}
            {isLoading && (
              <div className="text-center py-2">
                <Loader2 className="animate-spin text-gray-500 h-5 w-5 mx-auto" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
