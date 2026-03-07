"use client";

import React, { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ADD_DOC_FIELDS,
  DOC_GROUP_API,
  MY_DOC_CONTENT,
  MY_DOC_LIST,
  PLAN_GROUP_API,
  SAVE_DOC_TEMPLATE,
} from "@/constants/envConfig";
import { toast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Save, X } from "lucide-react";

const HeadingTemplate = dynamic(() => import("../myDocs/HeadingTemplate"), {
  ssr: false,
});
const RichTextTemplate = dynamic(() => import("../myDocs/RichTextTemplate"), {
  ssr: false,
});
const TableTemplate = dynamic(() => import("../myDocs/TableTemplate"), {
  ssr: false,
});
const ImageTemplate = dynamic(() => import("../myDocs/ImageTemplate"), {
  ssr: false,
});
const VideoTemplate = dynamic(() => import("../myDocs/VideoTemplate"), {
  ssr: false,
});

import { useSession } from "next-auth/react";
import { Session } from "../doc-template/DocTemplate";

import { v4 as uuidv4 } from "uuid";
import MyDocList from "../myDocs/MyDocList";
import { Card, CardContent } from "../ui/card";
import Link from "next/link";
import { Label } from "../ui/label";

// Component mapping object
const COMPONENT_MAP = {
  "Heading Label": HeadingTemplate,
  "Rich Text Editor": RichTextTemplate,
  Table: TableTemplate,
  Image: ImageTemplate,
  Video: VideoTemplate,
};

interface ComponentData {
  id: string;
  type: string;
  content: string;
}

interface Template {
  mydoc_id: number;
  template_name: string;
  components: ComponentData[];
}

const NewDocs = ({
  data,
  isEdit,
  isView,
}: {
  data?: any;
  isEdit?: boolean;
  isView?: boolean;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [myDocTemplates, setMyDocTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [componentsData, setComponentsData] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;
  const [docGroup, setDocGroup] = useState([]);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    template: "",
    docGroup: "",
    docName: "",
    description: "",
    status: "",
    file: null,
    fileName: "",
  });
  console.log("data----", data);

  useEffect(() => {
    if (data) {
      try {
        // Set form data
        setFormData({
          template: data?.mydoc_id?.toString() || "",
          docGroup: data.doc_group || "",
          docName: data.doc_name || "",
          description: data.doc_description || "",
          status: data.status || "",
          file: data?.doc_file_url || "",
          fileName: data?.doc_file_two || "",
        });

        // Parse and set template data
        if (data.doc_json) {
          const templateData = JSON.parse(data.doc_json);
          const template = {
            mydoc_id: templateData.template_id,
            template_name: templateData.template_name,
            components: templateData.components,
          };
          setSelectedTemplate(template);

          // Parse and set components data with their content
          if (data.content_json) {
            let contentData;
            try {
              contentData = JSON.parse(data.content_json);
              // Ensure contentData is an array
              if (!Array.isArray(contentData)) {
                contentData = JSON.parse(contentData);
              }
            } catch (error) {
              console.error("Error parsing content_json:", error);
              contentData = [];
            }

            const processedComponents = contentData.map((comp: any) => ({
              id:
                comp.id ||
                `${template.mydoc_id}-${Math.random()
                  .toString(36)
                  .substr(2, 9)}`,
              type: comp.type,
              content: comp.content || "",
            }));
            setComponentsData(processedComponents);
          }
        }
      } catch (error) {
        console.error("Error parsing data:", error);
        toast({
          description: "Error loading document data",
          variant: "destructive",
        });
      }
    }
  }, [data]);

  useEffect(() => {
    const fetchDocGroup = async () => {
      const response = await fetch(DOC_GROUP_API, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) {
        toast({
          description: "Failed to fetch doc group",
          variant: "destructive",
        });
        return;
      }
      const data = await response.json();
      setDocGroup(data);
    };
    fetchDocGroup();
  }, []);

  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch(SAVE_DOC_TEMPLATE, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch templates");
      const data = await response.json();
      const filteredData = data.filter(
        (item: any) => item.business_number === session?.user?.business_number,
      );
      setMyDocTemplates(filteredData);
    } catch (error) {
      toast({
        description: "Failed to fetch my doc templates",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = async (id: string) => {
    setErrors((prev) => ({ ...prev, template: "" }));

    setFormData((prev) => ({
      ...prev,
      template: id,
    }));

    // If we're in edit or view mode and already have components, don't fetch new ones
    // if ((isEdit || isView) && componentsData.length > 0) {
    //   return;
    // }

    try {
      const response = await fetch(`${ADD_DOC_FIELDS}?mydoc_id=eq.${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch template details");
      const data = await response.json();

      // Transform the API data into our desired format
      const template = {
        mydoc_id: data[0].mydoc_id,
        template_name: data[0].template_name,
        components: data.flatMap((item: any) => {
          let types;
          try {
            types = JSON.parse(item.component_type);
            // If types is a string, parse it again
            if (typeof types === "string") {
              types = JSON.parse(types);
            }
          } catch (error) {
            console.error("Error parsing component_type:", error);
            types = [];
          }

          // Check if we have field_content to match with types
          let fieldContent = [];
          try {
            if (item.field_content) {
              fieldContent = JSON.parse(item.field_content);
              if (typeof fieldContent === "string") {
                fieldContent = JSON.parse(fieldContent);
              }
            }
          } catch (error) {
            console.error("Error parsing field_content:", error);
          }

          return types.map((type: string) => {
            // Find matching content for this type
            const matchingContent = fieldContent.find(
              (content: any) => content.type === type,
            );

            return {
              id: `${item.mydoc_id}-${Math.random().toString(36).substr(2, 9)}`,
              type,
              content: matchingContent ? matchingContent.content : "",
            };
          });
        }),
      };

      setSelectedTemplate(template);
      setComponentsData(template.components);
    } catch (error) {
      console.error("Template fetch error:", error);
      toast({
        description: "Failed to fetch template details",
        variant: "destructive",
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const fields = ["docGroup", "docName", "description", "status"];

    fields.forEach((field) => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = "Required";
        return;
      }

      if (formData[field as keyof typeof formData]?.trim() === "") {
        newErrors[field] = "Required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContentChange = (id: string, content: string) => {
    setComponentsData((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, content } : comp)),
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
  ) => {
    setFileLoading(true);
    const selectedFile: any = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, ["fileName"]: selectedFile.name }));
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        toast({
          description: "Failed to upload file",
          variant: "destructive",
        });
        setFileLoading(false);
        return;
      }
      const data = await response.json();
      setFileLoading(false);
      console.log("data----", data);
      setFormData((prev) => ({ ...prev, [field]: data.url }));
    } catch (error) {
      setFileLoading(false);
      console.error("Upload error:", error);
      toast({
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    // if (!selectedTemplate) {
    //   toast({
    //     description: "No template selected",

    //     variant: "destructive",
    //   });
    //   return;
    // }
    setIsLoading(true);

    // Check if any component has content
    const hasContent = componentsData.some(
      (comp) => comp.content.trim() !== "",
    );
    // if (!hasContent) {
    //   toast({
    //     description: "Please enter content in at least one component",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Create formatted output
    const output = {
      template_id: selectedTemplate?.mydoc_id,
      template_name: selectedTemplate?.template_name,
      components: componentsData.map((comp) => ({
        type: comp.type,
        content: comp.content,
      })),
    };

    componentsData.forEach((comp) => {
      console.log(`\n${comp.type}----${comp.content}`);
    });

    const share_url = uuidv4();
    const payload = {
      mydoc_id: selectedTemplate?.mydoc_id,

      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      business_number: session?.user?.business_number,
      business_name: session?.user?.business_name,
      created_date: new Date().toISOString(),
      doc_name: formData.docName,
      doc_group: formData.docGroup,
      doc_file_two: formData.fileName,
      doc_file_url: formData.file,
      doc_no: 1,
      version_no: 1,
      doc_description: formData.description,
      status: formData.status,
      doc_json: JSON.stringify(output),
      shareurl: share_url,
      content_json: JSON.stringify(componentsData),
    };

    const response = await fetch(
      isEdit
        ? `${MY_DOC_LIST}?mydoc_list_id=eq.${data.mydoc_list_id}`
        : MY_DOC_LIST,
      {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) throw new Error("Failed to save document");
    toast({
      description: "Document saved successfully",
    });
    const getDocList = await fetch(`${MY_DOC_LIST}?shareurl=eq.${share_url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
    });
    if (!getDocList.ok) {
      toast({
        description: "Error fetching Doc List",
        variant: "destructive",
      });
    }
    const getDocData = await getDocList.json();
    const myDocContentPayload = {
      mydoc_list_id: getDocData[0].mydoc_list_id,
      doc_name: getDocData[0].doc_name,
      field_content: JSON.stringify(getDocData[0].content_json),
      field_json: JSON.stringify(getDocData[0].doc_json),
      component_type: JSON.stringify(componentsData.map((comp) => comp.type)),
    };
    const contentResponse = await fetch(MY_DOC_CONTENT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(myDocContentPayload),
    });
    if (!contentResponse.ok) {
      toast({
        description: "Failed to save content",
        variant: "destructive",
      });
      return;
    }
    setSelectedTemplate(null);
    setComponentsData([]);
    setFormData({
      template: "",
      docGroup: "",
      docName: "",
      description: "",
      status: "",
      file: null,
      fileName: "",
    });
    setIsLoading(false);
  };

  const renderComponent = (component: ComponentData) => {
    const Component =
      COMPONENT_MAP[component.type as keyof typeof COMPONENT_MAP];
    if (!Component) return null;

    return (
      <div key={component.id} className="mb-4">
        <Component
          content={component.content}
          onContentChange={(content: string) =>
            handleContentChange(component.id, content)
          }
          readOnly={isView}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto flex items-center max-w-[800px] w-full p-4">
      <Card className="border-0 p-0 m-0 md:border w-full md:p-2 md:m-4">
        <CardContent className="px-1.5 py-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {isEdit ? "Edit Doc" : isView ? "View Doc" : "New Doc"}
            </h1>
            <div>
              <Button className="border-0" variant="outline">
                <Link href="/Docs">Back to Docs</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-8 mt-4">
            <div>
              <div className="flex justify-between">
                <Label htmlFor="docGroup">
                  Doc Group <span className="text-red-500">*</span>
                </Label>
                {errors.docGroup && (
                  <p className="text-red-500 text-sm">{errors.docGroup}</p>
                )}
              </div>

              <Select
                disabled={isView}
                value={formData.docGroup}
                onValueChange={(value) => handleSelectChange(value, "docGroup")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Doc Group" />
                </SelectTrigger>

                <SelectContent>
                  {docGroup.map((item: any) => (
                    <SelectItem key={item.doc_group_id} value={item.doc_group}>
                      {item.doc_group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="docName">
                  Doc Name <span className="text-red-500">*</span>
                </Label>

                {errors.docName && (
                  <p className="text-red-500 text-sm">{errors.docName}</p>
                )}
              </div>

              <Input
                id="docName"
                disabled={isView}
                placeholder="Enter doc name"
                value={formData.docName}
                onChange={handleChange}
                className={errors.docName ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>

                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>

              <Input
                id="description"
                disabled={isView}
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
                className={errors.description ? "border-red-500" : ""}
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="status">
                  Status <span className="text-red-500">*</span>
                </Label>
                {errors.status && (
                  <p className="text-red-500 text-sm">{errors.status}</p>
                )}
              </div>
              <Select
                disabled={isView}
                value={formData.status}
                onValueChange={(value) => handleSelectChange(value, "status")}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                  id="status"
                >
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="InActive">InActive</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <div>
                <Label htmlFor="file-upload">File Upload</Label>
              </div>
              <div>
                <div className="border relative flex items-center justify-between rounded-md">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    disabled={isView}
                    accept=".doc,.docx,.xls,.xlsx,.csv,.pdf,.ppt,.pptx"
                    id="file-upload"
                    onChange={(e) => handleFileChange(e, "file")}
                    className="cursor-pointer hidden border-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload File
                    </Button>
                    <p className="text-sm text-gray-500">
                      {formData.fileName || "Choose a file..."}
                    </p>
                  </div>
                  {/* {formData.file && (
                    <div className="absolute right-2">
                      <X
                        className="text-muted-foreground cursor-pointer w-5 h-5"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            file: null,
                            fileName: "",
                          }))
                        }
                      />
                    </div>
                  )} */}
                </div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <div>
                  <div className="flex justify-between">
                    <Label htmlFor="country">Template</Label>
                    {errors.template && (
                      <p className="text-red-500 text-sm">{errors.template}</p>
                    )}
                  </div>
                  <Select
                    disabled={isView}
                    onValueChange={handleTemplateSelect}
                    value={formData.template}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {myDocTemplates.map((template: any) => (
                        <SelectItem
                          key={template.mydoc_id}
                          value={template.mydoc_id.toString()}
                        >
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedTemplate && (
                <div>
                  {/* <div className="flex items-center justify-between mb-6">
                    <Input
                      type="text"
                      value={selectedTemplate.template_name}
                      onChange={(e) =>
                        setSelectedTemplate((prev) =>
                          prev
                            ? { ...prev, template_name: e.target.value }
                            : null
                        )
                      }
                      className="text-4xl mb-1 font-bold tracking-tight border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                    />
                    <Button
                      className="rounded-full px-6 h-10 text-base"
                      onClick={handleSave}
                      disabled={isLoading}
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div> */}

                  <div className="space-y-4">
                    {componentsData.map(renderComponent)}
                  </div>
                </div>
              )}
            </div>
            {!isView && (
              <div className="flex justify-end gap-2">
                <Link href="/Docs">
                  <Button variant="outline">Cancel</Button>
                </Link>
                <Button
                  className=""
                  onClick={handleSave}
                  disabled={isLoading || fileLoading}
                >
                  {isLoading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewDocs;
