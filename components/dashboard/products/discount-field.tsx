import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

interface DiscountFieldsProps {
  form: UseFormReturn<any>;
  discountTypeField: string;
  discountValueField: string;
  startDateField: string;
  endDateField: string;
  prefix?: string;
}

export function DiscountFields({
  form,
  discountTypeField,
  discountValueField,
  startDateField,
  endDateField,
  prefix = "",
}: DiscountFieldsProps) {
  const discountType = form.watch(discountTypeField);

  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={form.control}
          name={discountTypeField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discount type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={DiscountType.PERCENTAGE}>
                    Percentage (%)
                  </SelectItem>
                  <SelectItem value={DiscountType.FIXED_AMOUNT}>
                    Fixed Amount ($)
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={discountValueField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount Value</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step={discountType === DiscountType.PERCENTAGE ? "1" : "0.01"}
                  placeholder="0"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                />
              </FormControl>
              {discountType && (
                <FormDescription>
                  {discountType === DiscountType.PERCENTAGE
                    ? "Enter percentage (e.g., 20 for 20% off)"
                    : "Enter amount in dollars"}
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <FormField
          control={form.control}
          name={startDateField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={endDateField}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
