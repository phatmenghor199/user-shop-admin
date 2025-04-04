"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  variant?: "danger" | "warning" | "info";
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showIcon?: boolean;
}

const ConfirmDialog = ({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  variant = "danger",
  className,
  size = "md",
  showIcon = true,
}: CustomDialogProps) => {
  const [isMounted, setIsMounted] = useState(false);

  // Handle escape key press
  useEffect(() => {
    setIsMounted(true);

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscapeKey);

    return () => {
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Don't render on the server
  if (!isMounted) return null;

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <AlertCircle className="h-6 w-6 text-destructive" />,
          confirmButtonVariant: "destructive" as const,
          title: "text-destructive",
        };
      case "warning":
        return {
          icon: <AlertCircle className="h-6 w-6 text-amber-500" />,
          confirmButtonVariant: "default" as const,
          title: "text-amber-500",
        };
      case "info":
      default:
        return {
          icon: <AlertCircle className="h-6 w-6 text-blue-500" />,
          confirmButtonVariant: "default" as const,
          title: "text-blue-500",
        };
    }
  };

  // Get size class
  const getSizeClass = () => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-md";
      case "lg":
        return "max-w-lg";
      case "xl":
        return "max-w-xl";
      case "full":
        return "max-w-[95vw] min-h-[95vh] md:max-w-[90vw] md:max-h-[90vh]";
      default:
        return "max-w-md";
    }
  };

  const variantStyles = getVariantStyles();
  const sizeClass = getSizeClass();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                duration: 0.2,
              }}
              className={cn(
                "bg-background relative overflow-hidden rounded-lg shadow-xl w-full",
                sizeClass,
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {showIcon && (
                    <div className="flex-shrink-0 mt-0.5">
                      {variantStyles.icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2
                      className={cn(
                        "text-xl font-semibold mb-2",
                        variantStyles.title
                      )}
                    >
                      {title}
                    </h2>
                    {description && (
                      <p className="text-muted-foreground mb-6">
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="mt-3 sm:mt-0"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={variantStyles.confirmButtonVariant}
                    onClick={onConfirm}
                  >
                    {confirmLabel}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
