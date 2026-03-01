"use client";
import React, { useEffect, useState } from "react";
import { MY_DOC_LIST } from "@/constants/envConfig";
import { toast } from "@/components/ui/use-toast";
import NewDocs from "@/components/Docs/NewDocs";

const ViewDocs = ({
  params,
}: {
  params: { id: string; mydoc_list_id: string };
}) => {
  const { id, mydoc_list_id } = params;
  const [docData, setDocData] = useState([]);

  useEffect(() => {
    const fetchDocData = async () => {
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
        toast({
          description: "Failed to fetch contact data",
          variant: "destructive",
        });
      }
      const data = await response.json();
      setDocData(data[0]);
    };
    fetchDocData();
  }, [id, mydoc_list_id]);

  return (
    <div className="max-w-[800px]  w-full md:p-4 p-2 mx-auto">
      <NewDocs data={docData} isEdit={false} isView={true} />
    </div>
  );
};

export default ViewDocs;
