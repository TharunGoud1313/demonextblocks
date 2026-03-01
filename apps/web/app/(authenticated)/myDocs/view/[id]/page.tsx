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
import { MY_DOC_CONTENT, MY_DOC_LIST } from "@/constants/envConfig";
import { ArrowLeft, Save } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

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

const ViewDoc = ({ params }: { params: { id: string } }) => {
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
    const fetchDocContent = async () => {
      const response = await fetch(`${MY_DOC_CONTENT}?mydoc_list_id=eq.${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch document content");
        return;
      }

      const data = await response.json();

      if (data.length === 0) return;

      // Extract template details
      const template = {
        mydoc_list_id: data[0].mydoc_list_id,
        template_name: data[0].doc_name,
      };

      let fieldContent = data[0].field_content;
      let componentTypes = data[0].component_type;

      try {
        fieldContent = JSON.parse(fieldContent);
        if (typeof fieldContent === "string") {
          fieldContent = JSON.parse(fieldContent);
        }
      } catch (error) {
        console.warn("Error parsing field_content:", error);
      }

      try {
        componentTypes = JSON.parse(componentTypes);
      } catch (error) {
        console.warn("Error parsing component_type:", error);
      }

      // Ensure we correctly associate types with content
      const components = componentTypes.map((type: string) => {
        const matchingComponent = fieldContent.find(
          (comp: any) => comp.type === type,
        );

        return {
          id: `${template.mydoc_list_id}-${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          type,
          content: matchingComponent ? matchingComponent.content : "", // Assign correct content
        };
      });

      setTemplate(template);
      setComponentsData(components);
    };

    fetchDocContent();
  }, [id]);

  const handleContentChange = (id: string, content: string) => {
    setComponentsData((prev) =>
      prev.map((comp) => (comp.id === id ? { ...comp, content } : comp)),
    );
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
          readOnly={true}
        />
      </div>
    );
  };
  return (
    <div className="mx-auto flex items-center max-w-[800px] w-full p-4">
      <div className="space-y-8">
        <div>
          {template && (
            <div>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="border-0"
              >
                <span className="flex items-center gap-2">
                  <ArrowLeft /> Back to Doc List
                </span>
              </Button>
              <div className="flex items-center mt-2 justify-between mb-6">
                <Input
                  type="text"
                  value={template.template_name}
                  disabled
                  onChange={(e) =>
                    setTemplate((prev: any) =>
                      prev ? { ...prev, template_name: e.target.value } : null,
                    )
                  }
                  className="text-4xl mb-1 font-bold tracking-tight border-none bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                />
              </div>

              <div className="space-y-4">
                {componentsData.map(renderComponent)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewDoc;
