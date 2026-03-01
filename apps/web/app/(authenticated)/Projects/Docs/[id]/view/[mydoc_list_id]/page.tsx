"use client";
import React, { useEffect, useState } from "react";
import { MY_DOC_LIST } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewDocs from "@/components/Docs/NewDocs";
import NewProjectDocs from "@/components/Projects/Docs/NewDocs";

const ViewProjectDocs = ({
  params,
}: {
  params: { id: string; mydoc_list_id: string };
}) => {
  const { id, mydoc_list_id } = params;
  const [docData, setDocData] = useState<any>(null);

  useEffect(() => {
    const fetchDocData = async () => {
      try {
        const response = await fetch(
          `${MY_DOC_LIST}?mydoc_list_id=eq.${mydoc_list_id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        if (data[0]) {
          // Parse the doc_json field to get template and components
          const docJson = JSON.parse(data[0].doc_json || "{}");

          // Combine the original data with parsed template info
          const processedData = {
            ...data[0],
            template: {
              template_id: docJson.template_id,
              template_name: docJson.template_name,
              components: docJson.components || [],
            },
          };

          setDocData(processedData);
        }
      } catch (error) {
        toast({
          description: "Failed to fetch document data",
          variant: "destructive",
        });
      }
    };

    fetchDocData();
  }, [mydoc_list_id]);

  return (
    <div className="max-w-[800px] w-full md:p-4 p-2 mx-auto">
      <NewProjectDocs data={docData} isEdit={false} isView={true} id={id} />
    </div>
  );
};

export default ViewProjectDocs;
