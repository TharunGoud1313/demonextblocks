/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";

import { FormFieldType } from "@/types";
import { cn } from "@/lib/utils";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
// import { PasswordInput } from '@/components/ui/password-input'
import { PasswordInput } from "../ui/password-input";
import { Slider } from "@/components/ui/slider";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Dock,
  ExternalLink,
  File,
  Link,
  Star,
  Table,
  UploadIcon,
  XIcon,
} from "lucide-react";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "../ui/multi-select";
import { SmartDatetimeInput } from "@/components/ui/smart-datetime-input";
import LocationSelector from "@/components/ui/location-input";
import SignatureInput from "@/components/ui/signature-input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Progress } from "../ui/progress";
import { MediaCard } from "../ui/media-card";
import MediaSocialPage from "../ui/media-social-page";
import BarChartPage from "../ui/bar-chart-page";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import dynamic from "next/dynamic";
import { FaFilePdf } from "react-icons/fa";
import { TimePicker } from "../ui/TimePicker";
import { DateTimePicker } from "../ui/DateTimePicker";
import { TimeRangePicker } from "../ui/TimeRangePicker";

const RichTextEditor = dynamic(
  () => import("../ui/RichTextEditors/RichTextEditor"),
  { ssr: false },
);
const HeadingEditor = dynamic(
  () => import("../ui/RichTextEditors/HeadingEditor"),
  { ssr: false },
);
const TableEditor = dynamic(() => import("../ui/RichTextEditors/TableEditor"), {
  ssr: false,
});
const ImageEditor = dynamic(() => import("../ui/RichTextEditors/ImageEditor"), {
  ssr: false,
});
const VideoEditor = dynamic(() => import("../ui/RichTextEditors/VideoEditor"), {
  ssr: false,
});

import { usePathname } from "next/navigation";

const ALLOWED_FILES_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const ALLOWED_PDF_TYPES = ["application/pdf"];

const MAX_FILES_SIZE = 5 * 1024 * 1024;

export const renderFormField = (
  field: FormFieldType,
  form: any,
  apiFieldData: any,
) => {
  const [checked, setChecked] = useState<boolean>(field.checked);
  const [value, setValue] = useState<any>(field.value);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [tagsValue, setTagsValue] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [pdf, setPdf] = useState<File[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<string[]>([]);
  const [date, setDate] = useState<Date>();
  const [fromTime, setFromTime] = useState<Date>(new Date());
  const [toTime, setToTime] = useState<Date>(
    new Date(new Date().setHours(new Date().getHours() + 1)),
  );
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [smartDatetime, setSmartDatetime] = useState<Date | null>();
  const [countryName, setCountryName] = useState<string>("");
  const [stateName, setStateName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(13);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const path = usePathname();
  const currentPath = path.includes("submit");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];
  const [timePickerDate, setTimePickerDate] = useState<Date>(new Date());
  const [enhancedDate, setEnhancedDate] = useState<Date>(new Date());
  const [rating, setRating] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const MAX_VIDEO_SIZE = 2 * 1024 * 1024;

  const handleIframeUrlChange = (url: string) => {
    setIframeUrl(url);
    field.value = url;
    setValue(url);
  };

  const handleScoreClick = (selectedScore: number) => {
    setScore(selectedScore);
    form.setValue(field.name, selectedScore.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    form.setValue(field.name, selectedRating.toString(), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file types and size
      const validFiles = newFiles.filter(
        (file) =>
          ALLOWED_FILES_TYPES.includes(file.type) &&
          file.size <= MAX_FILES_SIZE,
      );

      if (validFiles.length !== newFiles.length) {
        setUploadError(
          "Please ensure all files are in PDF, DOC, DOCX, XLS, XLSX, or CSV format and under 5MB.",
        );
        return;
      }

      setUploadError(null);
      setUploading(true);
      if (!currentPath) {
        setFiles(validFiles);
      }
      if (currentPath) {
        const formData = new FormData();
        validFiles.forEach((file) => {
          formData.append("file", file);
        });

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          setUploadedFileUrl(data.url);
          if (data.url) {
            localStorage.setItem("uploadedFileUrl", data.url);
          }
          setFiles(validFiles);
          setValue(validFiles);
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const getFileIcon = (fileName: any) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "pdf":
        return <FaFilePdf className="w-8 h-8 text-red-500" />;
      case "doc":
      case "docx":
        return <Dock className="w-8 h-8 text-blue-500" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <Table className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleFileSubmit = async (e: any) => {
    e.preventDefault();
    setFileUploadError("");
    if (!fileUrl) {
      setFileUploadError("Please enter a valid video url");
      return;
    }
    const validFileUrlPattern =
      /^(https?:\/\/.*\.(doc|docx|xls|xlsx|csv|ppt|pptx|txt))$|^(https?:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[a-zA-Z0-9-_]+)/i;
    if (!validFileUrlPattern.test(fileUrl)) {
      setFileUploadError("Invalid File URL. Please provide a valid File Link.");
      return;
    }
    const fileName = fileUrl.split("/").pop(); // Extract file name from URL
    const fileMock = {
      name: fileName || "unknown",
      url: fileUrl, // Use URL as the source
      type: fileUrl.split(".").pop(), // Extract the extension
    };
    if (currentPath) {
      const payload = {
        url: fileUrl,
      };
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.url) {
          localStorage.setItem("uploadedFileUrl", data.url);
        }
        setFiles((prevFiles: any) => [...prevFiles, fileMock]);
        setValue((prevValues: any) => [...prevValues, fileMock]);
        // setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);

        // setValue(validImages);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload video URL. Please try again.");
      }
    }

    // Update the files state to include the new file
    setFiles((prevFiles: any) => [...prevFiles, fileMock]);
    setValue((prevValues: any) => [...prevValues, fileMock]);
  };

  const removeFile = () => {
    setFiles([]);
    setUploadedFileUrl(null);
    setValue([]);
    setFileUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideo = Array.from(e.target.files);
      const validVideo = newVideo.filter(
        (video) => video.size <= MAX_VIDEO_SIZE,
      );
      if (validVideo.length !== newVideo.length) {
        setVideoUrl("");
        setVideoError("No video selected");
      }
      const newPreview = validVideo.map((video) => URL.createObjectURL(video));
      if (!currentPath) {
        setVideos((prevPreviews) => [...prevPreviews, ...newPreview]);
      }

      if (currentPath) {
        const formData = new FormData();
        validVideo.forEach((file) => {
          formData.append("file", file);
        });

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          if (data.url) {
            localStorage.setItem("uploadedVideoUrl", data.url);
          }
          setVideos((prevPreviews) => [...prevPreviews, ...newPreview]);
          setVideoUrl("");
          setVideoError("");
          setValue(validVideo);
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const handleVideoSubmit = async (e: any) => {
    e.preventDefault();
    if (!videoUrl) {
      setVideoError("Please enter a valid video url");
      return;
    }
    const validUrlPattern =
      /^(https?:\/\/.*\.(mp4|mov|avi|mkv|webm))|(https?:\/\/(www\.)?youtube\.com\/watch\?v=\w+)|(https?:\/\/youtu\.be\/\w+)/;
    if (!validUrlPattern.test(videoUrl)) {
      setVideoError(
        "Invalid video URL. Please provide a direct video link or YouTube link.",
      );
      return;
    }

    if (!currentPath) {
      setVideos((prevVideos) => [...prevVideos, videoUrl]);
    }

    if (currentPath) {
      const payload = {
        url: videoUrl,
      };
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.url) {
          localStorage.setItem("uploadedVideoUrl", data.url);
        }
        setVideos((prevVideos) => [...prevVideos, videoUrl]); // Add URL to video list
        setVideoUrl(""); // Clear input field
        setVideoError(""); // Clear error messages
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload video URL. Please try again.");
      }
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      const validImages = newImages.filter(
        (file) =>
          ALLOWED_FILE_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE,
      );

      if (validImages.length !== newImages.length) {
        setError(
          "Some files were not added. Please ensure all files are images (JPG, PNG, or GIF) and under 5MB.",
        );
      } else {
        setError(null);
      }

      setImages((prevImages: any) => [...prevImages, ...validImages]);
      setValue([...images, ...validImages]);

      const newPreviews = validImages.map((file) => URL.createObjectURL(file));
      setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

      if (currentPath) {
        const formData = new FormData();
        validImages.forEach((file) => {
          formData.append("file", file);
        });

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          setUploadedFileUrl(data.url);
          if (data.url) {
            localStorage.setItem("uploadedImageUrl", data.url);
          }
          setImages(validImages);
          setValue(validImages);
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const handleImageSubmit = async (e: any) => {
    e.preventDefault();
    setImageUploadError("");
    if (!imageUrl) {
      setImageUploadError("Please enter a valid video url");
      return;
    }
    const validImageUrlPattern =
      /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp|tif|svg))$/i;
    if (!validImageUrlPattern.test(imageUrl)) {
      setImageUploadError(
        "Invalid Image URL. Please provide a valid Image Link.",
      );
      return;
    }

    if (!currentPath) {
      setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);
    }

    if (currentPath) {
      const payload = {
        url: imageUrl,
      };
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.url) {
          localStorage.setItem("uploadedImageUrl", data.url);
        }
        setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);
        // setValue(validImages);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload video URL. Please try again.");
      }
    }
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate file types and size
      const validFiles = newFiles.filter(
        (file) =>
          ALLOWED_PDF_TYPES.includes(file.type) && file.size <= MAX_FILES_SIZE,
      );

      if (validFiles.length !== newFiles.length) {
        setUploadError("Please ensure files are in PDF format and under 5MB.");
        return;
      }

      setUploadError(null);
      setUploading(true);
      if (!currentPath) {
        setPdf(validFiles);
      }
      if (currentPath) {
        const formData = new FormData();
        validFiles.forEach((file) => {
          formData.append("file", file);
        });

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }

          const data = await response.json();
          setUploadedFileUrl(data.url);
          if (data.url) {
            localStorage.setItem("uploadedPdfUrl", data.url);
          }
          setPdf(validFiles);
          setValue(validFiles);
        } catch (error) {
          console.error("Upload error:", error);
          setUploadError("Failed to upload file. Please try again.");
        } finally {
          setUploading(false);
        }
      }
    }
  };

  const handlePdfSubmit = async (e: any) => {
    e.preventDefault();
    setPdfUploadError("");
    if (!pdfUrl) {
      setPdfUploadError("Please enter a valid video url");
      return;
    }
    const validFileUrlPattern = /^(https?:\/\/.*\.(pdf)$)/i;
    if (!validFileUrlPattern.test(pdfUrl)) {
      setPdfUploadError("Invalid File URL. Please provide a valid File Link.");
      return;
    }
    const fileName = pdfUrl.split("/").pop(); // Extract file name from URL
    const fileMock = {
      name: fileName || "unknown",
      url: pdfUrl, // Use URL as the source
      type: pdfUrl.split(".").pop(), // Extract the extension
    };
    if (currentPath) {
      const payload = {
        url: pdfUrl,
      };
      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        if (data.url) {
          localStorage.setItem("uploadedFileUrl", data.url);
        }
        setFiles((prevFiles: any) => [...prevFiles, fileMock]);
        setValue((prevValues: any) => [...prevValues, fileMock]);
        // setImagePreviews((prevVideos) => [...prevVideos, imageUrl]);

        // setValue(validImages);
      } catch (error) {
        console.error("Upload error:", error);
        setUploadError("Failed to upload video URL. Please try again.");
      }
    }

    // Update the files state to include the new file
    setPdf((prevFiles: any) => [...prevFiles, fileMock]);
    setValue((prevValues: any) => [...prevValues, fileMock]);
  };

  const handleRemovePdf = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Clear PDF states
    setPdf([]);
    setPdfUrl("");

    // Clear uploaded file URL in localStorage if exists
    if (currentPath) {
      localStorage.removeItem("uploadedPdfUrl");
    }

    // Additional cleanup if you're using other states
    setUploadError(null);
    setUploadedFileUrl(null);
  };

  const removeVideo = (index: number) => {
    setVideos((prevVideos: any[]) => prevVideos.filter((_, i) => i !== index));
  };

  const removeImage = (index: number) => {
    setImages((prevImages: any[]) => prevImages.filter((_, i) => i !== index));
    setImageUrl("");
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index),
    );
    setValue(images.filter((_: any, i: number) => i !== index));
  };

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  switch (field.variant) {
    case "Seperator":
      return (
        <div className="space-y-2">
          <p>{field.name}</p>
          <Separator />
          <p>{field.description}</p>
        </div>
      );

    case "File Upload":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-all duration-300 ease-in-out"
                    >
                      {files && files?.length > 0 ? (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <div className="text-4xl font-bold text-primary mb-2">
                            {getFileIcon(files[0].name)}
                          </div>
                          <div className="text-sm text-primary truncate max-w-[80%]">
                            {files[0].name}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="absolute top-2 right-2"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col p-2.5 items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-primary">
                            DOC, DOCX, XLS, XLSX, CSV (MAX. 5MB)
                          </p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        accept=".doc,.docx,.xls,.xlsx,.csv"
                        className="hidden"
                        disabled={fileUrl?.length > 0}
                      />
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-sm text-red-500">{uploadError}</p>
                  )}
                  {currentPath && uploading && (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="text-sm text-primary">Uploading...</span>
                    </div>
                  )}
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Input
                      value={fileUrl}
                      placeholder="Enter File URL"
                      className="border-secondary"
                      disabled={files?.length > 0}
                      onChange={(e) => setFileUrl(e.target.value)}
                    />
                    <Button
                      disabled={!fileUrl || files?.length > 0}
                      onClick={handleFileSubmit}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  {fileUploadError && (
                    <p className="text-red-500 mt-2">{fileUploadError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "PDF Upload":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary/80 transition-all duration-300 ease-in-out"
                    >
                      {pdf && pdf?.length > 0 ? (
                        <div className="flex flex-col items-center justify-center w-full h-full">
                          <div className="text-4xl font-bold text-primary mb-2">
                            <FaFilePdf className="text-red-500" />
                          </div>
                          <div className="text-sm text-primary truncate max-w-[80%]">
                            {pdf[0].name}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemovePdf}
                            className="absolute top-2 right-2"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col p-2.5 items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-primary">PDF (MAX. 5MB)</p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        onChange={handlePdfChange}
                        ref={fileInputRef}
                        accept=".pdf"
                        className="hidden"
                        disabled={pdf?.length > 0}
                      />
                    </label>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Input
                      value={pdfUrl}
                      placeholder="Enter Pdf URL"
                      className="border-secondary"
                      disabled={pdf?.length > 0}
                      onChange={(e) => setPdfUrl(e.target.value)}
                    />
                    <Button
                      disabled={!pdfUrl || pdf?.length > 0}
                      onClick={handlePdfSubmit}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  {pdfUploadError && (
                    <p className="text-red-500 mt-2">{pdfUploadError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Image Upload":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {imagePreviews.length > 0 ? (
                        <>
                          <Image
                            src={imagePreviews[0]}
                            alt="Preview"
                            layout="fill"
                            className=""
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeImage(0);
                            }}
                            className="absolute top-2 right-2 z-10"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-primary">
                            JPG, PNG, or GIF (MAX. 5MB)
                          </p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        disabled={imageUrl?.length > 0}
                        accept=".jpg,.jpeg,.png,.gif"
                        className="hidden"
                      />
                    </label>
                  </div>
                  {imageError && (
                    <p className="text-sm text-red-500">{imageError}</p>
                  )}
                  <div className="mt-2.5 flex items-center gap-2.5">
                    <Input
                      value={imageUrl}
                      placeholder="Enter Image URL"
                      className="border-secondary"
                      disabled={images?.length > 0}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button
                      disabled={!imageUrl || images?.length > 0}
                      onClick={handleImageSubmit}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Add URL
                    </Button>
                  </div>
                  {imageUploadError && (
                    <p className="text-red-500 mt-2">{imageUploadError}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Video Upload":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className={`relative flex flex-col items-center justify-center w-full ${
                        videos?.length > 0 ? "h-fit" : "h-64"
                      } border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                    >
                      {videos.length > 0 ? (
                        <div className="relative w-full">
                          {videos[0].startsWith("http") ? (
                            /(youtube\.com|youtu\.be)/.test(videos[0]) ? (
                              <iframe
                                src={videos[0].replace("watch?v=", "embed/")}
                                title="video-preview"
                                className="h-64 w-full"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={videos[0]}
                                controls
                                className="h-fit w-full"
                              />
                            )
                          ) : (
                            <video
                              src={videos[0]}
                              controls
                              className="h-fit w-full"
                            />
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeVideo(0);
                            }}
                            className="absolute top-2 right-2 z-10"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload a video
                            </span>
                          </p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        onChange={handleVideoChange}
                        accept=".mp4, .mov, .avi, .mkv, .webm"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5">
                  <Input
                    value={videoUrl}
                    placeholder="Enter video URL (supports YouTube links)"
                    className="border-secondary"
                    disabled={videos?.length > 0}
                    onChange={(e) => setVideoUrl(e.target.value)}
                  />
                  <Button
                    disabled={!videoUrl || videos?.length > 0}
                    onClick={handleVideoSubmit}
                  >
                    <Link className="w-4 h-4 mr-2" />
                    Add URL
                  </Button>
                </div>
                {videoError && (
                  <p className="text-red-500 mt-2">{videoError}</p>
                )}
              </CardContent>
            </Card>
          </FormControl>
        </FormItem>
      );
    case "Send Image":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {field?.placeholder_file_url ? (
                        <>
                          <Image
                            src={field?.placeholder_file_url}
                            alt="Preview"
                            layout="fill"
                            className=""
                          />
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-primary">
                            JPG, PNG, or GIF (MAX. 5MB)
                          </p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        readOnly
                        ref={fileInputRef}
                        disabled
                        accept=".jpg,.jpeg,.png,.gif"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Send Video":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor={`${field.name}-upload`}
                      className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {field?.placeholder_video_url ? (
                        <>
                          {field?.placeholder_video_url.startsWith("http") ? (
                            /(youtube\.com|youtu\.be)/.test(
                              field?.placeholder_video_url,
                            ) ? (
                              <iframe
                                src={field?.placeholder_video_url.replace(
                                  "watch?v=",
                                  "embed/",
                                )}
                                title="video-preview"
                                className="h-64 w-full"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={field?.placeholder_video_url}
                                controls
                                className="h-64 w-full"
                              />
                            )
                          ) : (
                            <video
                              src={field?.placeholder_video_url}
                              controls
                              className="h-fit w-full"
                            />
                          )}
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                          <p className="mb-2 text-sm text-primary">
                            <span className="font-semibold">
                              Click to upload video
                            </span>{" "}
                          </p>
                        </div>
                      )}
                      <Input
                        id={`${field.name}-upload`}
                        type="file"
                        readOnly
                        ref={fileInputRef}
                        disabled
                        accept=".mp4, .mov, .avi, .mkv, .webm"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );

    case "Send File":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor={`${field.name}-upload`}
                        className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                      >
                        {field?.placeholder_file_upload_url ? (
                          <>
                            <div className="text-4xl font-bold text-primary mb-2">
                              {getFileIcon(
                                field?.placeholder_file_upload_url
                                  ?.split("/")
                                  .at(-1),
                              )}
                            </div>
                            <div className="text-sm flex flex-wrap text-primary line-clamp-2 truncate max-w-[80%]">
                              {field?.placeholder_file_upload_url
                                .split("/")
                                .at(-1)}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col p-2.5 items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                            <p className="mb-2 text-sm text-primary">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-primary">
                              DOC, DOCX, XLS, XLSX, CSV (MAX. 5MB)
                            </p>
                          </div>
                        )}
                        <Input
                          id={`${field.name}-upload`}
                          type="file"
                          readOnly
                          ref={fileInputRef}
                          disabled
                          accept=".doc,.docx,.xls,.xlsx,.csv"
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex w-full justify-end">
                    <Button
                      className="m-2 flex flex-end items-end self-end"
                      onClick={(e) => {
                        e.preventDefault();
                        const link: any = document.createElement("a");
                        link.href = field.placeholder_file_upload_url;
                        link.download =
                          field?.placeholder_file_upload_url
                            ?.split("/")
                            .at(-1) || "file";
                        link.click();
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Send Pdf":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor={`${field.name}-upload`}
                        className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                      >
                        {field?.placeholder_pdf_file_url ? (
                          <>
                            <div className="text-4xl font-bold text-primary mb-2">
                              <FaFilePdf className="text-red-500" />
                            </div>
                            <div className="text-sm flex flex-wrap text-primary line-clamp-2 truncate max-w-[80%]">
                              {field?.placeholder_pdf_file_url
                                .split("/")
                                .at(-1)}
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                            <p className="mb-2 text-sm text-primary">
                              <span className="font-semibold">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </p>
                            <p className="text-xs text-primary">
                              PDF (MAX. 5MB)
                            </p>
                          </div>
                        )}
                        <Input
                          id={`${field.name}-upload`}
                          type="file"
                          readOnly
                          ref={fileInputRef}
                          disabled
                          accept=".pdf"
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex w-full justify-end">
                    <Button
                      className="m-2 flex flex-end items-end self-end"
                      onClick={(e) => {
                        e.preventDefault();
                        if (field?.placeholder_pdf_file_url) {
                          window.open(
                            field?.placeholder_pdf_file_url,
                            "_blank",
                          ); // Open the file in a new tab
                        }
                      }}
                    >
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Text Box":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>{" "}
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>

          <FormControl className="flex justify-between">
            <Input
              className={
                form.formState.errors?.[field.name] ? "border-red-500" : ""
              }
              placeholder={field.placeholder}
              disabled={field.disabled}
              type={field?.type}
            />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Label":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>{" "}
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <Input className="bg-gray-100" value={field.label} readOnly />
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );

    case "Text Area":
      return (
        <FormItem>
          <div className="flex justify-between">
            <div>
              <FormLabel>{field.label}</FormLabel>{" "}
              <span className="text-red-500">{field.required && "*"}</span>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <Textarea
              placeholder={field.placeholder}
              className={
                form.formState.errors?.[field.name] ? "border-red-500" : ""
              }
              // {...field}
            />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Heading":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <HeadingEditor />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Rich Text Editor":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <RichTextEditor />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Table":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <TableEditor />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Image":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <ImageEditor />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    case "Video":
      return (
        <FormItem>
          <div className="flex justify-between items-center">
            <div>
              <FormLabel>{field.label}</FormLabel>
            </div>
            <FormMessage />
          </div>
          <FormControl>
            <VideoEditor />
          </FormControl>
          <FormDescription>{field.description}</FormDescription>
        </FormItem>
      );
    default:
      return null;
  }
};
