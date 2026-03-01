"use client";
import { Session } from "@/components/doc-template/DocTemplate";
import dynamic from "next/dynamic";

const HeadingTemplate = dynamic(
  () => import("@/components/myDocs/HeadingTemplate"),
  { ssr: false },
);
const ImageTemplate = dynamic(
  () => import("@/components/myDocs/ImageTemplate"),
  { ssr: false },
);
const RichTextTemplate = dynamic(
  () => import("@/components/myDocs/RichTextTemplate"),
  { ssr: false },
);
const TableTemplate = dynamic(
  () => import("@/components/myDocs/TableTemplate"),
  { ssr: false },
);
const VideoTemplate = dynamic(
  () => import("@/components/myDocs/VideoTemplate"),
  { ssr: false },
);

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  ADD_DOC_FIELDS,
  MY_DOC_CONTENT,
  MY_DOC_LIST,
  SAVE_DOC_TEMPLATE,
} from "@/constants/envConfig";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
interface ComponentData {
  id: string;
  type: string;
  content: string;
}

const COMPONENT_MAP = {
  "Heading Label": HeadingTemplate,
  "Rich Text Editor": RichTextTemplate,
  Table: TableTemplate,
  Image: ImageTemplate,
  Video: VideoTemplate,
};

const NewDoc = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const [template, setTemplate] = useState<any>(null);
  const [componentsData, setComponentsData] = useState<ComponentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData
    ? (sessionData as unknown as Session)
    : null;
  const router = useRouter();

  useEffect(() => {
    const fetchTemplateData = async () => {
      try {
        const response = await fetch(`${ADD_DOC_FIELDS}?mydoc_id=eq.${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch template data");
        }

        const data = await response.json();
        if (data[0]) {
          const templateData = data[0];

          // Parse the component types from the template
          const componentTypes = JSON.parse(
            templateData.component_type || "[]",
          );

          // Create empty components based on the template types
          const components = componentTypes.map((type: string) => ({
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            type,
            content: "", // Initialize with empty content
          }));

          setTemplate({
            ...templateData,
            template_name: templateData.template_name,
          });

          console.log("Template data:", templateData);
          console.log("Component types:", componentTypes);
          console.log("Created components:", components);

          setComponentsData(components);
        }
      } catch (error) {
        console.error("Error fetching template data:", error);
        toast({
          description: "Failed to fetch template data",
          variant: "destructive",
        });
      }
    };

    fetchTemplateData();
  }, [id]);

  const handleContentChange = (id: string, content: string) => {
    setComponentsData((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, content } : comp)),
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    if (!template) {
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
      template_id: template.mydoc_id,
      template_name: template.template_name,
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
      mydoc_id: template.mydoc_id,
      status: "Published",
      created_user_id: session?.user?.id,
      created_user_name: session?.user?.name,
      business_number: session?.user?.business_number,
      business_name: session?.user?.business_name,
      created_date: new Date().toISOString(),
      doc_name: template.template_name,
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
    setTemplate(null);
    router.push("/myDocs");
    setComponentsData([]);
    setIsLoading(false);
  };

  // Updated renderComponent function to match the working version
  const renderComponent = (component: ComponentData) => {
    const Component =
      COMPONENT_MAP[component.type as keyof typeof COMPONENT_MAP];
    if (!Component) {
      console.error(`Component type not found: ${component.type}`);
      return null;
    }

    return (
      <div key={component.id} className="mb-4">
        <Component
          content={component.content || ""}
          onContentChange={(content: string) =>
            handleContentChange(component.id, content)
          }
          readOnly={false}
        />
      </div>
    );
  };

  return (
    <div className="mx-auto flex items-center max-w-[800px] w-full p-4">
      <div className="space-y-8 w-full">
        <div>
          {template && (
            <div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-0"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft /> Back to Templates
                </span>
              </Button>
              <div className="flex items-center mt-2 justify-between mb-6">
                <Input
                  type="text"
                  value={template.template_name}
                  onChange={(e) =>
                    setTemplate((prev: any) =>
                      prev ? { ...prev, template_name: e.target.value } : null,
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
                {componentsData.length > 0 ? (
                  componentsData.map(renderComponent)
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No components found in this template
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewDoc;
