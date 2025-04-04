"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageIcon, UploadCloud } from "lucide-react";

interface SubmissionResult {
  id?: string;
  url?: string;
  error?: string;
}

const ImageUploadAndBannerSubmission = () => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  // Function to convert file to base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        if (typeof fileReader.result === "string") {
          // We need to remove the prefix from the base64 string
          // e.g., "data:image/jpeg;base64," is removed
          const base64String = fileReader.result.split(",")[1];
          resolve(base64String);
        } else {
          reject(new Error("Failed to convert to base64"));
        }
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  // Function to get image type from file
  const getImageType = (file: File): string => {
    return file.type.split("/")[1]; // e.g., "image/jpeg" -> "jpeg"
  };

  // Handle image file selection (just for preview)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store the file for later upload
    setImageFile(file);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle the full submission process
  const handleSubmit = async () => {
    if (!imageFile) {
      alert("Please select an image first");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionResult(null);

      // Step 1: Convert image to base64
      const base64Image = await convertToBase64(imageFile);
      const imageType = getImageType(imageFile);

      console.log("Starting image upload...");

      // Step 2: Upload the image
      const imageResponse = await axios.post("/api/v1/images", {
        base64Image: base64Image,
        imageType: imageType,
      });

      const imageUrl = imageResponse.data.url;
      console.log("Image uploaded successfully:", imageResponse.data);

      // Step 3: Create the banner with the image URL
      const bannerResponse = await axios.post("/api/v1/banner", {
        description: description,
        imageUrl: imageUrl,
        status: status,
      });

      console.log("Banner created successfully:", bannerResponse.data);
      setSubmissionResult(bannerResponse.data);
    } catch (error) {
      console.error("Error during submission:", error);
      setSubmissionResult({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setImagePreview(null);
    setImageFile(null);
    setSubmissionResult(null);
    setDescription("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Create Banner</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6">
                {imagePreview ? (
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        Drag and drop your banner image here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 1200 x 400 pixels (3:1 ratio)
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      className="relative gap-2"
                      disabled={isSubmitting}
                    >
                      <UploadCloud className="h-4 w-4" />
                      <span>Upload Image</span>
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 cursor-pointer opacity-0"
                        onChange={handleImageChange}
                        disabled={isSubmitting}
                      />
                    </Button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Image Requirements</h3>
                <ul className="list-inside list-disc text-sm text-muted-foreground">
                  <li>File formats: JPG, PNG, or WebP</li>
                  <li>Maximum file size: 2MB</li>
                  <li>Recommended aspect ratio: 3:1</li>
                  <li>Minimum width: 1200 pixels</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banner Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter banner description"
                  className="mt-1 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <label className="text-base">Active Status</label>
                  <p className="text-sm text-muted-foreground">
                    Make this banner active immediately after creation.
                  </p>
                </div>
                <Switch
                  checked={status === "ACTIVE"}
                  onCheckedChange={(checked) =>
                    setStatus(checked ? "ACTIVE" : "INACTIVE")
                  }
                  disabled={isSubmitting}
                />
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={!imageFile || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Create Banner"}
              </Button>

              {submissionResult && (
                <div
                  className={`rounded-md p-4 ${
                    submissionResult.error ? "bg-red-50" : "bg-green-50"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      submissionResult.error ? "text-red-800" : "text-green-800"
                    }`}
                  >
                    {submissionResult.error
                      ? `Error: ${submissionResult.error}`
                      : `Banner submitted successfully! ID: ${submissionResult.id}`}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageUploadAndBannerSubmission;
