/* eslint-disable @next/next/no-img-element */
"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import LocationSelector from "../ui/location-input";
import { Progress } from "../ui/progress";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ExternalLink,
  File,
  FileText,
  Link,
  Star,
  Table,
  UploadIcon,
  XIcon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { MediaCard } from "../ui/media-card";
import MediaSocialPage from "../ui/media-social-page";
import BarChartPage from "../ui/bar-chart-page";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";
import { FaFilePdf } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa";
import SendMediaCard from "./field-components/SendMediaCard";
import { format } from "date-fns";
import { TimePicker } from "../ui/TimePicker";
import { DateTimePicker } from "../ui/DateTimePicker";
import { TimeRangePicker } from "../ui/TimeRangePicker";
import AnalyticCard from "./field-components/AnalyticCard";
import {
  generateChartConfig,
  generateQuery,
  runGenerateSQLQuery,
} from "../chat-with-db/actions";
import { toast } from "sonner";
import { Result } from "@/lib/types";
import { useSession } from "next-auth/react";
import { Session } from "./FormBuilder";
import AnalyticJSON from "./chat-with-data-json/AnalyticJSON";
import SendMediaCardJSON from "./chat-with-data-json/SendMediaCard";

const ALLOWED_FILES_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];
const ALLOWED_PDF_TYPES = ["application/pdf"];

const RenderInputField = ({
  currentField,
  input,
  setInput,
  formData,
  setFormData,
  setSelectedImage,
  setSelectedFile,
  apiFieldData,
  videos,
  setVideos,
  videoError,
  setVideoError,
  imageError,
  setImageError,
  selectedImage,
  selectedFile,
  fileError,
  setFileError,
  fileName,
  setFileName,
  selectedPdf,
  setSelectedPdf,
  pdfError,
  setPdfError,
  pdfName,
  setPdfName,
  setResults,
  setColumns,
  setChartConfig,
  setLoading,
  setComponentName,
  setApiData,
}: {
  currentField: any;
  input: string;
  setInput: (value: string) => void;
  formData: Record<string, any>;
  setFormData: (formData: Record<string, any>) => void;
  setSelectedImage: any;
  setSelectedFile: any;
  apiFieldData: any;
  videos: any;
  setVideos: any;
  videoError: any;
  setVideoError: any;
  imageError: any;
  setImageError: any;
  selectedImage: any;
  selectedFile: any;
  fileError: any;
  setFileError: any;
  fileName: any;
  setFileName: any;
  pdfName: any;
  setPdfName: any;
  selectedPdf: any;
  setSelectedPdf: any;
  pdfError: any;
  setPdfError: any;
  setResults: any;
  setChartConfig: any;
  setColumns: any;
  setLoading: any;
  setComponentName: any;
  setApiData: (data: any) => any;
}) => {
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [value, setValue] = useState(currentField.value);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [multiSelectedItems, setMultiSelectedItems] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [timePickerDate, setTimePickerDate] = useState<Date>(new Date());
  const [fromTime, setFromTime] = useState<Date>(new Date());
  const [toTime, setToTime] = useState<Date>(
    new Date(new Date().setHours(new Date().getHours() + 1))
  );
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [enhancedDate, setEnhancedDate] = useState<Date>(new Date());
  const [rating, setRating] = useState(0);
  const [score, setScore] = useState<number | null>(null);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

  const MAX_VIDEO_SIZE = 2 * 1024 * 1024;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleStarClick = (selectedRating: number) => {
    setRating(selectedRating);
    setInput(`You rated: ${selectedRating} stars`);
  };

  const handleScoreClick = (selectedScore: number) => {
    setScore(selectedScore);
    setInput(`Your recommendation score: ${selectedScore}`);
  };

  const handleIframeUrlChange = (url: string) => {
    setIframeUrl(url);
    setInput(url);
  };

  const handleSubmit = async (suggestion: any, dataFilter: any) => {
    setLoading(true);
    const question = suggestion;
    if (!suggestion) return;
    try {
      const query = await generateQuery(question, session, dataFilter);
      console.log("query----", query);
      if (query === undefined) {
        toast.error("An error occurred. Please try again.");
        return;
      }
      const data = await runGenerateSQLQuery(query);
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      setResults(data);
      setColumns(columns);
      const generation = await generateChartConfig(data, question);
      setChartConfig(generation.config);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      preference: value,
    }));
    const selectedItem = currentField.chat_with_data?.buttons?.find(
      (item: any) => item?.button_text === value
    );
    if (selectedItem) {
      setComponentName(selectedItem);
    }
    if (selectedItem?.enable_prompt) {
      handleSubmit(selectedItem?.prompt, selectedItem?.prompt_dataFilter);
    }
    if (selectedItem?.enable_api || selectedItem?.enable_dataApi) {
      setApiData(selectedItem);
    }
  };

  useEffect(() => {
    if (currentField.variant === "Badge") {
      setInput(currentField.name);
    } else if (currentField.variant === "Label") {
      setInput(currentField.placeholder);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentField.variant]);

  const handleVideoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newVideo = Array.from(e.target.files);
      const validVideo = newVideo.filter(
        (video) => video.size <= MAX_VIDEO_SIZE
      );
      if (validVideo.length !== newVideo.length) {
        setVideoError("No video selected");
      }
      const newPreview = validVideo.map((video) => URL.createObjectURL(video));

      setVideos((prevPreviews: any) => [...prevPreviews, ...newPreview]);
      // setInput(newPreview[0])
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
        "Invalid video URL. Please provide a direct video link or YouTube link."
      );
      return;
    }
    setVideos((prevVideos: any) => [...prevVideos, videoUrl]);
    // setInput(videoUrl)
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);

      // Validate image size
      const validImages = newImages.filter(
        (image) => image.size <= MAX_IMAGE_SIZE // Replace `MAX_IMAGE_SIZE` with your desired size limit in bytes
      );

      if (validImages.length !== newImages.length) {
        setImageError(
          "Some images were not uploaded. Please ensure all images are under the size limit."
        );
        return;
      }

      // Generate previews for valid images
      const newPreviews = validImages.map((image) =>
        URL.createObjectURL(image)
      );

      // Update state
      setSelectedImage((prevImages: any) => [...prevImages, ...newPreviews]);
      // setInput(newPreviews[0]);
      setImageError(null);
    }
  };

  const handleImageSubmit = async (e: any) => {
    e.preventDefault();

    if (!imageUrl) {
      setImageError("Please enter a valid image URL.");
      return;
    }

    const validImageUrlPattern = /^(https?:\/\/.*\.(jpg|jpeg|png|gif|webp))$/i;
    if (!validImageUrlPattern.test(imageUrl)) {
      setImageError("Invalid Image URL. Please provide a valid image link.");
      return;
    }

    // Add the image URL to the state
    setSelectedImage((prevImages: any) => [...prevImages, imageUrl]);
    setImageUrl(""); // Clear input field
  };

  const handleFileSubmit = async (e: any) => {
    e.preventDefault();

    if (!fileUrl) {
      setFileError("Please enter a valid file URL.");
      return;
    }

    const validFileUrlPattern =
      /^(https?:\/\/.*\.(doc|docx|xls|xlsx|csv|pdf|ppt|pptx|txt))$|^(https?:\/\/docs\.google\.com\/(document|spreadsheets)\/d\/[a-zA-Z0-9-_]+)/i;
    if (!validFileUrlPattern.test(fileUrl)) {
      setFileError("Invalid File URL. Please provide a valid file link.");
      return;
    }

    const fileName = fileUrl.split("/").pop();

    // Add the image URL to the state
    setSelectedFile((prevImages: any) => [...prevImages, fileName]);
    setFileName(fileName);
    setFileUrl(""); // Clear input field
  };

  const getFileIcon = (fileName: any) => {
    const extension = fileName.split(".").pop().toLowerCase();
    switch (extension) {
      case "doc":
      case "docx":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "xls":
      case "xlsx":
      case "csv":
        return <Table className="w-8 h-8 text-green-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate image size
      const validFiles = newFiles.filter(
        (file) =>
          ALLOWED_FILES_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE // Replace `MAX_IMAGE_SIZE` with your desired size limit in bytes
      );

      if (validFiles.length !== newFiles.length) {
        setFileError(
          "Some Files were not uploaded. Please ensure all files are under the size limit."
        );
        return;
      }

      // Generate previews for valid images
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      // Update state
      setSelectedFile((prevFiles: any) => [...prevFiles, ...newPreviews]);
      // setInput(newPreviews[0]);
      setFileName(e.target.files[0].name);

      setFileError(null);
    }
  };

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);

      // Validate image size
      const validFiles = newFiles.filter(
        (file) =>
          ALLOWED_PDF_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE // Replace `MAX_IMAGE_SIZE` with your desired size limit in bytes
      );

      if (validFiles.length !== newFiles.length) {
        setFileError(
          "Some Files were not uploaded. Please ensure all files are under the size limit."
        );
        return;
      }

      // Generate previews for valid images
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

      // Update state
      setSelectedPdf((prevFiles: any) => [...prevFiles, ...newPreviews]);
      // setInput(newPreviews[0]);
      setPdfName(e.target.files[0].name);

      setPdfError(null);
    }
  };

  const handlePdfSubmit = async (e: any) => {
    e.preventDefault();

    if (!pdfUrl) {
      setPdfError("Please enter a valid file URL.");
      return;
    }

    const validFileUrlPattern = /^(https?:\/\/.*\.(pdf)$)/i;
    if (!validFileUrlPattern.test(pdfUrl)) {
      setPdfError("Invalid File URL. Please provide a valid file link.");
      return;
    }

    const fileName = fileUrl.split("/").pop();

    // Add the image URL to the state
    setSelectedPdf((prevImages: any) => [...prevImages, fileName]);
    setPdfName(fileName);
    setPdfUrl(""); // Clear input field
  };

  switch (currentField.variant) {
    case "Text Area":
      return (
        <Textarea
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 w-full placeholder:text-gray-400"
        />
      );
    case "Text Box":
      return (
        <Input
          type="text"
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 w-full placeholder:text-gray-400"
        />
      );
    case "Label":
      return (
        <Input
          type="text"
          placeholder={currentField.placeholder}
          readOnly
          value={currentField.placeholder}
          className=" border-gray-700 bg-gray-100 placeholder:text-gray-400"
        />
      );
    case "Number":
      return (
        <Input
          type="number"
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 placeholder:text-gray-400"
        />
      );
    case "Mobile":
      return (
        <Input
          type="number"
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 placeholder:text-gray-400"
        />
      );
    case "OTP":
      return (
        <Input
          type="text"
          maxLength={6}
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 placeholder:text-gray-400"
        />
      );
    case "Email":
      return (
        <Input
          type="email"
          placeholder={currentField.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 placeholder:text-gray-400"
        />
      );
    case "Password":
      return (
        <Input
          type="password"
          placeholder={currentField.placeholder}
          onChange={(e) => setInput(e.target.value)}
          className=" border-gray-700 placeholder:text-gray-400"
        />
      );
    case "Date":
      return (
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date: any) => {
            setSelectedDate(date);
            setInput(new Date(date).toDateString());
          }}
          className="rounded-md border"
        />
      );
    case "Time":
      return (
        <TimePicker
          value={timePickerDate}
          onChange={setTimePickerDate}
          setInput={setInput}
          form={undefined}
          field={undefined}
        />
      );
    case "From Time to To Time":
      return (
        <div className="flex items-center space-x-2">
          <TimeRangePicker
            fromTime={fromTime}
            toTime={toTime}
            onFromTimeChange={setFromTime}
            onToTimeChange={setToTime}
            form={undefined}
            field={undefined}
            setInput={setInput}
          />
        </div>
      );
    case "From Date to To Date":
      return (
        <div className="flex w-full justify-between items-center">
          <div className="flex flex-col gap-2 md:gap-0 md:flex-row w-full items-center space-x-2">
            {/* From Date */}
            <div className="grid w-full  items-center gap-1.5">
              <Label htmlFor="fromDate">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? (
                      format(fromDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={(newDate) => {
                      setFromDate(newDate);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid w-full  items-center gap-1.5">
              <Label htmlFor="toDate">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={(newDate) => {
                      setToDate(newDate);
                      setInput(
                        `From ${
                          fromDate ? format(fromDate, "yyyy-MM-dd") : "N/A"
                        } to ${newDate ? format(newDate, "yyyy-MM-dd") : "N/A"}`
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      );
    case "Date Time":
      return (
        <div>
          <DateTimePicker
            value={enhancedDate}
            onChange={setEnhancedDate}
            setInput={setInput}
            form={undefined}
            field={undefined}
          />
        </div>
      );

    case "Dropdown":
      return (
        <div className="flex gap-2.5 items-center w-full">
          {currentField.options?.map((option: any, index: number) => (
            <div
              key={index}
              className={`flex ${
                selectedOption === option
                  ? "bg-primary text-secondary"
                  : "bg-background"
              } cursor-pointer  border rounded-full p-2.5`}
              onClick={() => {
                setInput(option);
                setSelectedOption(option);
              }}
            >
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    case "Check Box":
      return (
        <div className="flex w-full items-center gap-2.5">
          <div className="flex  w-full items-center space-x-2">
            <div className="border rounded-full flex gap-2 items-center p-2.5">
              <Checkbox
                id="terms"
                onCheckedChange={(value: any) => setInput(currentField.label)}
              />
              <Label htmlFor="terms">{currentField.label}</Label>
            </div>
          </div>
        </div>
      );
    case "Check box label":
      return (
        <div className="flex  w-full items-center space-x-2">
          <div className="border rounded-full flex gap-2 items-center p-2.5">
            <Checkbox
              id="terms"
              onCheckedChange={(value: any) => setInput(currentField.label)}
            />
            <Label htmlFor="terms">{currentField.label}</Label>
          </div>
        </div>
      );
    case "Badge":
      return (
        <div>
          <Badge>{currentField.name}</Badge>
        </div>
      );
    case "Radio Group":
      return (
        <RadioGroup
          value={formData.preference}
          onValueChange={(value) => setInput(value)}
          className="flex w-full flex-wrap items-center"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            {apiFieldData?.length > 0
              ? apiFieldData?.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="flex border rounded-full p-2.5  items-center gap-2"
                  >
                    <RadioGroupItem value={item} id={index} />
                    <Label htmlFor={index}>{item}</Label>
                  </div>
                ))
              : currentField.radiogroup?.map((item: any, index: any) => (
                  <div
                    key={index}
                    className="flex border rounded-full p-2.5  items-center gap-2"
                  >
                    <RadioGroupItem value={item} id={index} />
                    <Label htmlFor={index}>{item}</Label>
                  </div>
                ))}
          </div>
        </RadioGroup>
      );

    case "Slider":
      return (
        <Slider
          // max={60}
          // step={1}
          // defaultValue={[50]}
          onValueChange={(value: any) =>
            // setFormData((prev: any) => ({ ...prev, [currentField.name]: value }))s
            setInput(value[0].toString())
          }
          // className="text-black w-[500px] bg-red-500 "
        />
      );

    case "Switch":
      return (
        <div className="flex items-center gap-2.5">
          <Switch
            checked={formData[currentField.checked]}
            onCheckedChange={(value: any) => {
              setFormData((prev: any) => ({
                ...prev,
                [currentField.name]: value,
              }));
              {
                value ? setInput("on") : setInput("off");
              }
            }}
            className="text-white"
          />
          <span>{currentField.label}</span>
        </div>
      );
    case "Image Upload":
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor={"image-upload"}
                  className={`relative flex flex-col items-center justify-center w-full ${
                    selectedImage?.length > 0 ? "h-fit" : "h-64"
                  } border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                >
                  {selectedImage?.length > 0 ? (
                    <div className="relative w-full">
                      <img
                        src={selectedImage[0]}
                        alt="Preview"
                        className="h-64 w-full "
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedImage((prevImages: any) =>
                            prevImages.filter(
                              (_: any, index: number) => index !== 0
                            )
                          );
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
                          Click to upload an image
                        </span>
                      </p>
                    </div>
                  )}
                  <Input
                    id={"image-upload"}
                    type="file"
                    onChange={handleImageChange}
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <Input
                value={imageUrl}
                placeholder="Enter image URL"
                className="border-secondary"
                disabled={selectedImage?.length > 0}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <Button disabled={!imageUrl} onClick={handleImageSubmit}>
                <Link className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Add URL</span>
              </Button>
            </div>
            {imageError && <p className="text-red-500 text-sm">{imageError}</p>}
          </CardContent>
        </Card>
      );
    case "File Upload":
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor={"file-upload"}
                  className={`relative flex flex-col items-center justify-center w-full ${
                    selectedFile?.length > 0 ? "h-64" : "h-64"
                  } border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                >
                  {selectedFile && selectedFile?.length > 0 ? (
                    <div className="flex p-2.5 flex-col items-center justify-center w-full h-full">
                      {getFileIcon(fileName)}
                      <span className="text-sm md:text-md flex flex-wrap">
                        {fileName}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedFile((prevImages: any) =>
                            prevImages.filter(
                              (_: any, index: number) => index !== 0
                            )
                          );
                        }}
                        className="absolute top-2 right-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex p-2.5 flex-col items-center justify-center pt-5 pb-6">
                      <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                      <p className="mb-2 text-sm text-primary">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-primary">
                        DOC, DOCX, XLS, XLSX, CSV (MAX. 5MB)
                      </p>
                    </div>
                  )}
                  <Input
                    id={"file-upload"}
                    type="file"
                    onChange={handleFileChange}
                    accept=".xlsx,.xls,.doc,.ppt,.txt,.docx,.pptx,.csv"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <Input
                value={fileUrl}
                placeholder="Enter file URL"
                className="border-secondary"
                disabled={selectedFile?.length > 0}
                onChange={(e) => setFileUrl(e.target.value)}
              />
              <Button disabled={!fileUrl} onClick={handleFileSubmit}>
                <Link className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Add URL</span>
              </Button>
            </div>
            {fileError && <p className="text-red-500 text-sm">{fileError}</p>}
          </CardContent>
        </Card>
      );
    case "PDF Upload":
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor={"pdf-upload"}
                  className={`relative flex flex-col items-center justify-center w-full ${
                    selectedPdf?.length > 0 ? "h-64" : "h-64"
                  } border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden`}
                >
                  {selectedPdf && selectedPdf?.length > 0 ? (
                    <div className="flex p-2.5 flex-col items-center justify-center w-full h-full">
                      <FaRegFilePdf className="w-8 h-8 mb-4 text-red-500" />
                      <span className="text-sm md:text-md flex flex-wrap">
                        {pdfName}
                      </span>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPdf((prevImages: any) =>
                            prevImages.filter(
                              (_: any, index: number) => index !== 0
                            )
                          );
                        }}
                        className="absolute top-2 right-2"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex p-2.5 flex-col items-center justify-center pt-5 pb-6">
                      <UploadIcon className="w-8 h-8 mb-4 text-primary" />
                      <p className="mb-2 text-sm text-primary">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-primary">PDF (MAX. 5MB)</p>
                    </div>
                  )}
                  <Input
                    id={"pdf-upload"}
                    type="file"
                    onChange={handlePdfChange}
                    accept=".pdf"
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-2.5">
              <Input
                value={pdfUrl}
                placeholder="Enter pdf URL"
                className="border-secondary"
                disabled={selectedPdf?.length > 0}
                onChange={(e) => setPdfUrl(e.target.value)}
              />
              <Button disabled={!fileUrl} onClick={handlePdfSubmit}>
                <Link className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Add URL</span>
              </Button>
            </div>
            {pdfError && <p className="text-red-500 text-sm">{pdfError}</p>}
          </CardContent>
        </Card>
      );
    case "Video Upload":
      return (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor={"video-upload"}
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
                          setVideos((prevImages: any) =>
                            prevImages.filter(
                              (_: any, index: number) => index !== 0
                            )
                          );
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
                    id={"video-upload"}
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
              <Button disabled={!videoUrl} onClick={handleVideoSubmit}>
                <Link className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Add URL</span>
              </Button>
            </div>
            {videoError && <p className="text-red-500 mt-2">{videoError}</p>}
          </CardContent>
        </Card>
      );
    case "Send Image":
      return (
        <>
          <>
            <Label htmlFor="send-image-upload">Uploaded Image</Label>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="send-image-upload"
                      className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {currentField?.placeholder_file_url ? (
                        <>
                          <Image
                            src={currentField?.placeholder_file_url}
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
                        id="send-image-upload"
                        type="file"
                        readOnly
                        // ref={fileInputRef}
                        disabled
                        accept=".jpg,.jpeg,.png,.gif"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </>
      );
    case "Send Video":
      return (
        <>
          <>
            <Label htmlFor="send-video-upload">Uploaded Video</Label>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="send-video-upload"
                      className="relative flex flex-col items-center justify-center w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {currentField?.placeholder_video_url ? (
                        <>
                          {currentField?.placeholder_video_url.startsWith(
                            "http"
                          ) ? (
                            /(youtube\.com|youtu\.be)/.test(
                              currentField?.placeholder_video_url
                            ) ? (
                              <iframe
                                src={currentField?.placeholder_video_url.replace(
                                  "watch?v=",
                                  "embed/"
                                )}
                                title="video-preview"
                                className="h-64 w-full"
                                frameBorder="0"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={currentField?.placeholder_video_url}
                                controls
                                className="h-64 w-full"
                              />
                            )
                          ) : (
                            <video
                              src={currentField?.placeholder_video_url}
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
                        id="send-video-upload"
                        type="file"
                        readOnly
                        // ref={fileInputRef}
                        disabled
                        accept=".mp4, .mov, .avi, .mkv, .webm"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </>
      );
    case "Send File":
      return (
        <>
          <>
            <Label htmlFor="send-file-upload">Uploaded File</Label>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="send-file-upload"
                      className="relative flex flex-col text-wrap w-[200px] items-center justify-center md:w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {currentField?.placeholder_file_upload_url ? (
                        <>
                          <div className="text-4xl font-bold text-primary mb-2">
                            {getFileIcon(
                              currentField?.placeholder_file_upload_url
                                ?.split("/")
                                .at(-1)
                            )}
                          </div>
                          <div className="text-sm w-[200px] text-wrap p-2 flex flex-wrap text-primary truncate md:max-w-[80%]">
                            {currentField?.placeholder_file_upload_url
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
                        id="send-file-upload"
                        type="file"
                        readOnly
                        // ref={fileInputRef}
                        disabled
                        accept=".doc,.docx,.xls,.xlsx,.csv"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </>
      );
    case "Send Pdf":
      return (
        <>
          <>
            <Label htmlFor="send-pdf-upload">Uploaded Pdf File</Label>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="send-pdf-upload"
                      className="relative flex flex-col items-center justify-center w-[200px] md:w-full h-64 border border-primary border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-secondary transition-all duration-300 ease-in-out overflow-hidden"
                    >
                      {currentField?.placeholder_pdf_file_url ? (
                        <>
                          <div className="text-4xl font-bold text-primary mb-2">
                            <FaFilePdf className="text-red-500" />
                          </div>
                          <div className="text-sm flex flex-wrap text-wrap text-primary  truncate max-w-[80%]">
                            {currentField?.placeholder_pdf_file_url
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
                          <p className="text-xs text-primary">PDF (MAX. 5MB)</p>
                        </div>
                      )}
                      <Input
                        id="send-pdf-upload"
                        type="file"
                        readOnly
                        // ref={fileInputRef}
                        disabled
                        accept=".pdf"
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        </>
      );
    case "Send Media Card":
      return (
        <div className="w-full">
          <SendMediaCard field={currentField} />
        </div>
      );

    case "Combobox":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !currentField.value && "text-muted-foreground"
              )}
            >
              {value
                ? currentField.combobox?.find((item: any) => item === value)
                : "Select option"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search language..." />
              <CommandList>
                <CommandEmpty>No option found.</CommandEmpty>
                <CommandGroup>
                  {currentField.combobox?.map((item: any) => (
                    <CommandItem
                      value={item}
                      key={item}
                      onSelect={() => {
                        setInput(item);
                        setValue(item);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          item === currentField.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {item}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );

    // );

    // );
    case "Multi Select":
      const toggleItem = (item: string) => {
        const updatedSelection = multiSelectedItems.includes(item)
          ? multiSelectedItems.filter((selected) => selected !== item) // Remove item if already selected
          : [...multiSelectedItems, item]; // Add item if not selected

        setMultiSelectedItems(updatedSelection);
        setInput(updatedSelection.join(","));
      };
      return (
        <div className="w-full flex gap-2.5 items-center flex-wrap">
          {currentField?.multiselect?.map((item: string, index: number) => (
            <div
              key={index}
              className={`border cursor-pointer gap-3 rounded-full flex  items-center p-2.5 ${
                multiSelectedItems.includes(item)
                  ? "bg-primary text-secondary"
                  : ""
              }`}
              onClick={() => toggleItem(item)}
            >
              <Checkbox
                checked={multiSelectedItems.includes(item)}
                // onChange={() => toggleItem(item)}
                onCheckedChange={() => toggleItem(item)}
                className="cursor-pointer"
              />
              <span>{item}</span>
            </div>
          ))}
        </div>
      );

    case "Location Select":
      return (
        <div className="w-full">
          <LocationSelector
            onCountryChange={(country) => {
              setFormData((prev: any) => ({
                ...prev,
                [currentField.name]: [country?.name || ""],
              }));
              setInput(currentField.name);
            }}
            onStateChange={(state) => {
              setFormData((prev: any) => ({
                ...prev,
                [currentField.name]: [state?.name || ""],
              }));
              setInput(currentField.name);
            }}
          />
        </div>
      );
    case "Progress":
      const timer = setTimeout(() => setInput("50"), 500);
      () => clearTimeout(timer);
      return (
        <div>
          <p>{currentField.label}</p>
          <Progress value={50} className="w-[60%]" />
        </div>
      );
    case "Media Card":
      return (
        <div>
          <MediaCard
            title={currentField.label || "Exciting New Product"}
            description={
              currentField.description || "Discover our latest innovation."
            }
            value={currentField.value}
            onTitleChange={(newTitle) => {
              currentField.label = newTitle;
              // form.setValue(`${field.name}`, newTitle);
            }}
            onDescriptionChange={(newDescription) => {
              currentField.description = newDescription;
              // form.setValue(`${field.name}`, newDescription);
            }}
            onMediaChange={(media: any) => {
              currentField.value = media;
              // form.setValue(field.name, media);
              setInput(currentField.value.name);
            }}
          />
        </div>
      );
    case "Media Card & Social Icons":
      return (
        <MediaSocialPage
          title={currentField.label || ""}
          description={currentField.description || ""}
          value={currentField.value}
          onTitleChange={(newTitle) => {
            currentField.label = newTitle;
            // form.setValue(`${field.name}`, newTitle);
          }}
          onDescriptionChange={(newDescription) => {
            currentField.description = newDescription;
            // form.setValue(`${field.name}`, newDescription);
          }}
          onMediaChange={(media: any) => {
            currentField.value = media;
            setInput(currentField.value.name);
            // form.setValue(field.name, media);
          }}
        />
      );
    case "Bar Chart with Social":
      return (
        <BarChartPage
          title={currentField.label || ""}
          description={currentField.description || ""}
          value={currentField.value}
          onTitleChange={(newTitle) => {
            currentField.label = newTitle;
            setInput(currentField.label);
            // form.setValue(`${field.name}`, newTitle);
          }}
          onDescriptionChange={(newDescription) => {
            currentField.description = newDescription;
            // form.setValue(`${field.name}`, newDescription);
          }}
        />
      );
    case "Iframe":
      return (
        <div>
          <Input
            type="text"
            className="flex-grow px-2 py-1 border rounded"
            placeholder="Enter iframe URL"
            value={iframeUrl || (currentField.value as string) || ""}
            onChange={(e) => {
              handleIframeUrlChange(e.target.value);
            }} // Call handler on change
          />

          {currentField.description || "Provide a valid iframe URL."}

          {/* Render iframe if URL is provided */}
          {iframeUrl || currentField.value ? (
            <div
              className="relative w-full h-28 mt-2 bg-gray-100 rounded-md overflow-hidden cursor-pointer group"
              onClick={() =>
                window.open(
                  iframeUrl || (currentField.value as string),
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 group-hover:bg-opacity-70 transition-opacity">
                <ExternalLink className="h-8 w-8 text-white" />
              </div>
              <iframe
                src={iframeUrl || (currentField.value as string)}
                className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                title="Embedded content preview"
              />
            </div>
          ) : (
            <div className="mt-2 w-full h-28 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
              <p className="text-xs text-gray-500 text-center">
                No iframe URL set
              </p>
            </div>
          )}
        </div>
      );
    case "Tool Tip Card":
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="link">{currentField.label}</Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div>
              <p>{currentField.label}</p>
              <p>{currentField.name}</p>
              <p>{currentField.description}</p>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    case "Send Review":
      return (
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`cursor-pointer ${
                star <= rating
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }`}
              onClick={() => handleStarClick(star)}
            />
          ))}
        </div>
      );
    case "Send Rating":
      return (
        <div className="flex flex-wrap justify-center gap-2">
          {[...Array(11)].map((_, index) => (
            <Button
              key={index}
              variant={score === index ? "default" : "outline"}
              className="w-10 h-10"
              onClick={(e) => {
                e.preventDefault();
                handleScoreClick(index);
              }}
            >
              {index}
            </Button>
          ))}
        </div>
      );
    case "Analytic Card":
      return <AnalyticCard field={currentField} />;
    case "Chat with Data":
    case "Chat with Data Auto":
      return (
        <div>
          {(currentField?.media_card_data?.media_url ||
            currentField?.media_card_data?.custom_html) && (
            <SendMediaCard field={currentField} />
          )}
          <RadioGroup
            value={formData.preference}
            onValueChange={(value) => {
              handleRadioChange(value);
            }}
            className="flex w-full flex-wrap items-center"
          >
            <div className="flex flex-wrap items-center gap-2.5">
              {currentField.chat_with_data?.buttons?.map(
                (item: any, index: any) =>
                  item?.button_text ? (
                    <div
                      key={index}
                      className="flex border rounded-full p-2.5  items-center gap-2"
                    >
                      <RadioGroupItem value={item?.button_text} id={index} />
                      <Label htmlFor={index}>{item?.button_text}</Label>
                    </div>
                  ) : null
              )}
            </div>
          </RadioGroup>
        </div>
      );
    case "Chat with Data JSON":
      return (
        <Card className="w-full overflow-hidden">
          <CardContent className="space-y-4 p-4">
            {(currentField?.media_card_data?.media_url ||
              currentField?.media_card_data?.custom_html) && (
              <div className="mb-4">
                <SendMediaCardJSON
                  field={currentField}
                  formData={formData}
                  onRadioChange={handleRadioChange}
                />
              </div>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default RenderInputField;
