"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ADD_DOC_FIELDS,
  MY_DOC_CONTENT,
  MY_DOC_LIST,
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
import { Save } from "lucide-react";

const HeadingTemplate = dynamic(() => import("./HeadingTemplate"), {
  ssr: false,
});
const RichTextTemplate = dynamic(() => import("./RichTextTemplate"), {
  ssr: false,
});
const TableTemplate = dynamic(() => import("./TableTemplate"), {
  ssr: false,
});
const ImageTemplate = dynamic(() => import("./ImageTemplate"), {
  ssr: false,
});
const VideoTemplate = dynamic(() => import("./VideoTemplate"), {
  ssr: false,
});

import { useSession } from "next-auth/react";
import { Session } from "../doc-template/DocTemplate";
import { v4 as uuidv4 } from "uuid";
import MyDocList from "./MyDocList";
import MyDocTemplates from "./MyDocTemplates";

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

const Doc = () => {
  const [activeTab, setActiveTab] = useState("new-doc");
  const [myDocTemplates, setMyDocTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [componentsData, setComponentsData] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;

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
      console.log("data----", data)
      // const filteredData = data.filter(
      //   (item: any) => item.business_number === session?.user?.business_number,
      // );
      setMyDocTemplates(data);
    } catch (error) {
      toast({
        description: "Failed to fetch my doc templates",
        variant: "destructive",
      });
    }
  };

  const handleTemplateSelect = async (id: string) => {
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

      const template = {
        mydoc_id: data[0].mydoc_id,
        template_name: data[0].template_name,
        components: data.flatMap((item: any) => {
          const types = JSON.parse(item.component_type);

          return types.map((type: string) => ({
            id: `${item.mydoc_id}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: "",
          }));
        }),
      };

      setSelectedTemplate(template);
      setComponentsData(template.components);
    } catch (error) {
      toast({
        description: "Failed to fetch template details",
        variant: "destructive",
      });
    }
  };

  const handleContentChange = (id: string, content: string) => {
    setComponentsData((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, content } : comp)),
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!selectedTemplate) {
      toast({
        description: "No template selected",

        variant: "destructive",
      });
      return;
    }

    // Check if any component has content
    const hasContent = componentsData.some(
      (comp) => comp.content.trim() !== "",
    );
    if (!hasContent) {
      toast({
        description: "Please enter content in at least one component",
        variant: "destructive",
      });
      return;
    }

    // Create formatted output
    const output = {
      template_id: selectedTemplate.mydoc_id,
      template_name: selectedTemplate.template_name,
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
      mydoc_id: selectedTemplate.mydoc_id,
      status: "Published",
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      business_number: session?.user?.business_number,
      business_name: session?.user?.business_name,
      created_date: new Date().toISOString(),
      doc_name: selectedTemplate.template_name,
      doc_json: JSON.stringify(output),
      shareurl: share_url,
      content_json: JSON.stringify(componentsData),
    };

    const response = await fetch(MY_DOC_LIST, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

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
        />
      </div>
    );
  };

  return (
    <div className="mx-auto flex items-center max-w-[800px] w-full p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="inline-flex h-9 w-full max-w-[360px] items-center justify-center rounded-[20px] bg-gray-100 p-1">
          <TabsTrigger
            value="new-doc"
            className="flex-1 rounded-[16px] px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-black data-[state=active]:text-white"
          >
            New Doc
          </TabsTrigger>
          <TabsTrigger
            value="doc-list"
            className="flex-1 rounded-[16px] px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Doc List
          </TabsTrigger>
          <TabsTrigger
            value="templates"
            className="flex-1 rounded-[16px] px-4 py-1.5 text-sm font-medium transition-all data-[state=active]:bg-black data-[state=active]:text-white"
          >
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-doc">
          <div className="space-y-8">
            <div>
              <div className="mb-4">
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger className="w-[200px]">
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

              {selectedTemplate && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Input
                      type="text"
                      value={selectedTemplate.template_name}
                      onChange={(e) =>
                        setSelectedTemplate((prev) =>
                          prev
                            ? { ...prev, template_name: e.target.value }
                            : null,
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
                  </div>

                  <div className="space-y-4">
                    {componentsData.map(renderComponent)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="doc-list">
          <MyDocList />
        </TabsContent>
        <TabsContent value="templates">
          <MyDocTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Doc;
